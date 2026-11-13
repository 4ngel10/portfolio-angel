-- Verificación del aislamiento entre clientes. SOLO LECTURA y repetible: son selects,
-- no cambia nada. Se lanza en el SQL Editor de Supabase, una consulta cada vez
-- (el editor solo muestra el resultado de la última).
--
-- Cuándo: después de lanzar una migración o db/rls.sql, y de vez en cuando.

-- ---------------------------------------------------------------------
-- (a) Tablas de public SIN RLS activado.
-- CORRECTO: 0 filas. Cualquier fila es una tabla que cualquier usuario con sesión
-- podría leer entera. Solución: alter table public.<tabla> enable row level security
-- y crear sus políticas en db/rls.sql.
-- ---------------------------------------------------------------------
select c.relname as tabla
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind in ('r', 'p')        -- tablas normales y particionadas
  and not c.relrowsecurity
order by c.relname;

-- ---------------------------------------------------------------------
-- (b) Permisos del rol anon (visitante sin sesión) en tablas, vistas y secuencias de public.
-- CORRECTO: 0 filas. rls.sql hace "revoke all ... from anon" en cada tabla del portal.
-- El blog solo le da permisos por columna sobre blog_posts, que no salen aquí (ver (g)).
-- Si sale alguna, aunque tenga RLS, conviene retirarla:
--   revoke all on public.<tabla> from anon;
-- Ojo con las tablas nuevas: Supabase puede concederle permisos a anon por defecto.
-- ---------------------------------------------------------------------
select table_name as objeto, privilege_type as permiso, 'tabla o vista' as tipo
from information_schema.role_table_grants
where grantee = 'anon' and table_schema = 'public'
union all
select object_name, privilege_type, 'secuencia'
from information_schema.role_usage_grants
where grantee = 'anon' and object_schema = 'public' and object_type = 'SEQUENCE'
order by 1, 2;

-- ---------------------------------------------------------------------
-- (c) Políticas por tabla de public.
-- CORRECTO, tabla por tabla:
--   * Todas: una política admin_all (cmd ALL, roles {authenticated}).
--   * proyectos, archivos, incidencias, bolsa_horas, bolsa_movimientos, documentos,
--     empresas, usuarios, hitos, mensajes_incidencia, presupuestos, presupuesto_lineas:
--     cliente_select (cmd SELECT, {authenticated}).
--   * Solo incidencias, mensajes_incidencia y archivos tienen cliente_insert (cmd INSERT).
--   * Nunca debe haber una política con cmd UPDATE o DELETE para clientes,
--     ni ninguna con el rol {public} o {anon}.
--   * bolsa_historial, ajustes, cobros, pagos, suscripciones y gastos: solo admin_all.
--   * blog_post_versions, blog_api_tokens, blog_api_uso y portfolio_project_versions: solo admin_all.
--   * portfolio_projects: igual que blog_posts (admin_all y publicado_select, misma condición).
--   * blog_posts: admin_all y publicado_select (SELECT, {anon,authenticated}). Es la ÚNICA
--     política que puede nombrar a anon. Su condición debe ser: status = 'publicado' and
--     published_at is not null and published_at <= now().
-- Las columnas condicion y con_check muestran la regla exacta.
-- ---------------------------------------------------------------------
select schemaname, tablename as tabla, policyname as politica, cmd as comando,
       roles, qual as condicion, with_check as con_check
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- ---------------------------------------------------------------------
-- (d) Funciones SECURITY DEFINER de public y quién puede ejecutarlas.
-- Una SECURITY DEFINER se ejecuta con los permisos de su dueño (se salta RLS), así que
-- cada una debe comprobar quién llama o no estar abierta a anon.
-- CORRECTO:
--   * anon_execute = false y public_execute = false en todas.
--   * current_empresa_id e is_admin: authenticated_execute = true (las usan las políticas).
--   * registrar_horas: authenticated_execute = true es normal, pero la función exige
--     is_admin() dentro y falla con 'forbidden' (42501) para un cliente.
--     Se comprueba en docs/pruebas-rls.md.
--   * mover_proyecto: igual que registrar_horas (exige is_admin() y falla con 42501 para un cliente).
--   * Cualquier otra función que salga aquí hay que revisarla a mano.
-- ---------------------------------------------------------------------
select p.proname as funcion,
       pg_get_function_identity_arguments(p.oid) as argumentos,
       pg_get_userbyid(p.proowner) as dueno,
       has_function_privilege('anon', p.oid, 'execute') as anon_execute,
       has_function_privilege('authenticated', p.oid, 'execute') as authenticated_execute,
       exists (
         select 1 from aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
         where a.grantee = 0 and a.privilege_type = 'EXECUTE'
       ) as public_execute,
       p.proconfig as config  -- debe incluir search_path= (vacío) para evitar secuestro de nombres
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.prosecdef
order by p.proname;

-- ---------------------------------------------------------------------
-- (e) Buckets de Storage y si son públicos.
-- CORRECTO: el bucket "archivos" con publico = false. El bucket "blog" SÍ es público (imágenes de
-- los artículos), con limite_bytes = 5242880 y solo image/webp, jpeg y png (el SVG se convierte a WebP antes de subirlo). Ningún bucket público salvo que
-- sea intencionado. Los archivos de clientes solo se sirven con URL firmada de 60 s
-- desde /api/storage/download.
-- ---------------------------------------------------------------------
select id as bucket, name as nombre, public as publico,
       file_size_limit as limite_bytes, allowed_mime_types
from storage.buckets
order by id;

-- Complemento de (e): políticas sobre storage.objects.
-- CORRECTO: archivos_select (SELECT, authenticated; primer segmento de la ruta = su empresa,
-- o admin), archivos_admin_write, finanzas_admin, blog_admin_write y portfolio_admin_write (ALL, solo admin).
-- Ninguna para anon ni para {public}: los buckets "blog" y "portfolio" son públicos por URL, no por política.
select policyname as politica, cmd as comando, roles, qual as condicion, with_check as con_check
from pg_policies
where schemaname = 'storage' and tablename = 'objects'
order by policyname;

-- ---------------------------------------------------------------------
-- (f) Filas de archivos con una ruta que no es de su empresa y proyecto, o que contiene "..".
-- CORRECTO: 0 filas. Con el check archivos_storage_path_check (migración 0008) no
-- debería poder aparecer ninguna.
-- ---------------------------------------------------------------------
select id, empresa_id, proyecto_id, storage_path
from public.archivos
where storage_path not like empresa_id::text || '/' || proyecto_id::text || '/%'
   or storage_path like '%..%';

-- ---------------------------------------------------------------------
-- (g) Columnas de public que puede leer el rol anon.
-- CORRECTO: solo blog_posts y portfolio_projects.
--   * blog_posts, 9 columnas: id, slug, category, status, published_at, content, og_image,
--     created_at y updated_at.
--   * portfolio_projects, 20 columnas: id, slug, status, published_at, orden, service, tech, cover,
--     tint, url, image, image_dark, og_image, cover_position, en_servicios, ejemplo,
--     datos_provisionales,
--     content, created_at y updated_at.
-- Ni created_by ni ninguna otra tabla.
-- ---------------------------------------------------------------------
select table_name as tabla, column_name as columna, privilege_type as permiso
from information_schema.role_column_grants
where grantee = 'anon' and table_schema = 'public'
order by 1, 2;

-- ---------------------------------------------------------------------
-- (h) Blog: artículos por estado (informativa, se ejecuta como admin).
-- Tras el seed debe salir una fila: publicado, visible_para_visitantes = true, 5 artículos.
-- Un publicado con fecha futura sale con visible_para_visitantes = false: está programado.
-- La prueba de lo que ve un visitante de verdad está en docs/pruebas-rls.md (apartado 5).
-- ---------------------------------------------------------------------
select status,
       (status = 'publicado' and published_at is not null and published_at <= now()) as visible_para_visitantes,
       count(*) as articulos
from public.blog_posts
group by 1, 2
order by 1, 2;

-- ---------------------------------------------------------------------
-- (i) Portfolio: proyectos por estado (informativa, se ejecuta como admin).
-- Tras el seed deben salir 6 proyectos publicados con visible_para_visitantes = true y 1 con
-- cifras provisionales. Un publicado con fecha futura sale con visible_para_visitantes = false:
-- está programado. La prueba de lo que ve un visitante de verdad está en docs/pruebas-rls.md (6).
-- ---------------------------------------------------------------------
select status,
       (status = 'publicado' and published_at is not null and published_at <= now()) as visible_para_visitantes,
       count(*) as proyectos,
       count(*) filter (where datos_provisionales) as con_cifras_provisionales
from public.portfolio_projects
group by 1, 2
order by 1, 2;
