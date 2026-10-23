-- =====================================================================
-- Row-Level Security de la zona de clientes.
-- Ejecutar en el SQL editor de Supabase DESPUÉS de aplicar la migración
-- de db/migrations (las tablas tienen que existir). Se puede repetir sin romper nada.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. Enlace con Supabase Auth: usuarios.id es el mismo uuid que auth.users.id.
-- ---------------------------------------------------------------------
alter table public.usuarios drop constraint if exists usuarios_id_auth_fk;
alter table public.usuarios
  add constraint usuarios_id_auth_fk
  foreign key (id) references auth.users (id) on delete cascade;

-- ---------------------------------------------------------------------
-- 1. Funciones auxiliares.
-- Son SECURITY DEFINER a propósito: leen `usuarios` saltándose RLS. Si las
-- políticas consultaran `usuarios` directamente, la política de `usuarios`
-- se llamaría a sí misma y Postgres devolvería "infinite recursion".
-- search_path vacío para que nadie pueda suplantar objetos.
-- ---------------------------------------------------------------------
create or replace function public.current_empresa_id()
returns uuid
language sql stable security definer set search_path = ''
as $$
  select empresa_id from public.usuarios where id = auth.uid()
$$;

-- is_admin() exige además que la sesión haya pasado el segundo factor (aal2). Sin eso, quien
-- robara un enlace mágico del admin leería y escribiría todo aunque la web le pida el TOTP.
-- Con el aal1 el admin sigue pudiendo leer su propia fila (política cliente_select), que es
-- lo que necesita la web para saber que debe mandarlo a /mfa.
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.usuarios where id = auth.uid() and role = 'admin')
     and coalesce(auth.jwt() ->> 'aal', '') = 'aal2'
$$;

revoke all on function public.current_empresa_id() from public, anon;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.current_empresa_id() to authenticated;
grant execute on function public.is_admin() to authenticated;

-- ---------------------------------------------------------------------
-- 2. Activar RLS y cerrar el acceso anónimo.
-- Con RLS activo y sin políticas para `anon`, un visitante sin sesión no ve nada.
-- Además se le retiran los permisos sobre las tablas.
-- 3. El admin tiene acceso total a cualquier tabla (política admin_all).
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'empresas','usuarios','proyectos','hitos','archivos',
    'incidencias','mensajes_incidencia','bolsa_horas','documentos'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon', t);
    execute format('drop policy if exists admin_all on public.%I', t);
    execute format(
      'create policy admin_all on public.%I for all to authenticated
         using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- 4. Clientes: solo lectura de lo que pertenece a su empresa.
-- Misma regla en todas las tablas con empresa_id:
--   empresa_id = (empresa del usuario autenticado)
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['proyectos','archivos','incidencias','bolsa_horas','documentos'] loop
    execute format('drop policy if exists cliente_select on public.%I', t);
    execute format(
      'create policy cliente_select on public.%I for select to authenticated
         using (empresa_id = public.current_empresa_id())', t);
  end loop;
end $$;

-- Empresa: cada cliente ve solo la suya.
drop policy if exists cliente_select on public.empresas;
create policy cliente_select on public.empresas for select to authenticated
  using (id = public.current_empresa_id());

-- Usuarios: ven a las personas de su empresa (para mostrar autores de mensajes).
-- No hay política de escritura para clientes: así nadie puede cambiarse el rol a admin.
drop policy if exists cliente_select on public.usuarios;
create policy cliente_select on public.usuarios for select to authenticated
  using (id = auth.uid() or empresa_id = public.current_empresa_id());

-- Hitos: no tienen empresa_id, se comprueba a través del proyecto.
drop policy if exists cliente_select on public.hitos;
create policy cliente_select on public.hitos for select to authenticated
  using (exists (
    select 1 from public.proyectos p
    where p.id = hitos.proyecto_id and p.empresa_id = public.current_empresa_id()
  ));

-- Mensajes: se leen a través de la incidencia.
drop policy if exists cliente_select on public.mensajes_incidencia;
create policy cliente_select on public.mensajes_incidencia for select to authenticated
  using (exists (
    select 1 from public.incidencias i
    where i.id = mensajes_incidencia.incidencia_id and i.empresa_id = public.current_empresa_id()
  ));

-- ---------------------------------------------------------------------
-- 5. Clientes: escrituras permitidas (solo dentro de su empresa).
-- ---------------------------------------------------------------------
-- Abrir una incidencia en un proyecto propio, siempre como "abierta".
drop policy if exists cliente_insert on public.incidencias;
create policy cliente_insert on public.incidencias for insert to authenticated
  with check (
    empresa_id = public.current_empresa_id()
    and estado = 'abierta'
    and exists (select 1 from public.proyectos p
                where p.id = proyecto_id and p.empresa_id = public.current_empresa_id())
  );

-- Escribir mensajes en incidencias propias, firmados con su propio id.
drop policy if exists cliente_insert on public.mensajes_incidencia;
create policy cliente_insert on public.mensajes_incidencia for insert to authenticated
  with check (
    autor_id = auth.uid()
    and exists (select 1 from public.incidencias i
                where i.id = incidencia_id and i.empresa_id = public.current_empresa_id())
  );

-- Registrar un archivo subido a un proyecto propio.
drop policy if exists cliente_insert on public.archivos;
create policy cliente_insert on public.archivos for insert to authenticated
  with check (
    empresa_id = public.current_empresa_id()
    and subido_por = auth.uid()
    and exists (select 1 from public.proyectos p
                where p.id = proyecto_id and p.empresa_id = public.current_empresa_id())
  );

-- ---------------------------------------------------------------------
-- 6. Storage: bucket privado "archivos" (50 MB por archivo, límite del plan gratuito).
-- Ruta de cada objeto: <empresa_id>/<proyecto_id>/<uuid>-<nombre>
-- La subida usa URL firmada (token propio), así que no hace falta política de insert.
-- Para leer, el primer segmento de la ruta tiene que ser la empresa del usuario.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit)
values ('archivos', 'archivos', false, 52428800)
on conflict (id) do update set public = false, file_size_limit = 52428800;

drop policy if exists archivos_select on storage.objects;
create policy archivos_select on storage.objects for select to authenticated
  using (
    bucket_id = 'archivos'
    and ((storage.foldername(name))[1] = public.current_empresa_id()::text or public.is_admin())
  );

drop policy if exists archivos_admin_write on storage.objects;
create policy archivos_admin_write on storage.objects for all to authenticated
  using (bucket_id = 'archivos' and public.is_admin())
  with check (bucket_id = 'archivos' and public.is_admin());
