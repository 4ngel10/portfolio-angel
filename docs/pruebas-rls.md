# Prueba manual del aislamiento entre clientes

Sirve para comprobar que un cliente solo ve y toca lo de su empresa. Se hace después de lanzar la migración 0008 y `db/rls.sql`, y cada vez que se cambien políticas o rutas de Storage.

Lanza cada bloque `begin ... rollback` por separado. Si un bloque falla (que es lo esperado en muchas pruebas), el editor se detiene y no ejecuta los siguientes.

Todo se lanza en el SQL Editor de Supabase con transacciones que terminan en `rollback`, así que no queda nada guardado. Antes, el paso 0 prepara dos empresas de prueba desde el panel de admin.

## 0. Preparar los datos de prueba

Desde `/admin` crea dos empresas de prueba con datos propios. Cuando termines, bórralas con "Eliminar" (archívalas primero).

1. **Empresa A (Prueba A)** con una persona cliente, por ejemplo `a@ejemplo.test`.
2. **Empresa B (Prueba B)** con una persona cliente, por ejemplo `b@ejemplo.test`.
3. En cada empresa, desde la ficha:
   - un proyecto activo (`Proyecto A`, `Proyecto B`),
   - un archivo subido a ese proyecto,
   - una incidencia abierta,
   - un presupuesto enviado (no borrador),
   - una bolsa de horas con algunas horas contratadas y un apunte.
4. Apunta estos datos en una nota aparte (no la subas al repo).

| Dato | Empresa A | Empresa B |
|---|---|---|
| uuid de la persona (`usuarios.id`) | `UUID_A` | `UUID_B` |
| uuid de la empresa | `EMPRESA_A` | `EMPRESA_B` |
| uuid del proyecto | `PROYECTO_A` | `PROYECTO_B` |
| `storage_path` del archivo | `RUTA_A` | `RUTA_B` |

Los uuid salen de las tablas `usuarios`, `empresas`, `proyectos` y `archivos` (Table Editor).

## 1. Comprobación general

Lanza `db/verificar-rls.sql`, una consulta cada vez, y compara con lo que dice cada comentario.

- (a) 0 filas.
- (b) 0 filas.
- (c) Solo políticas `admin_all`, `cliente_select` y los tres `cliente_insert` esperados, más `publicado_select` en `blog_posts` (la única que nombra a `anon`).
- (d) `anon_execute` y `public_execute` en `false` en todas las funciones.
- (e) El bucket `archivos` con `publico = false` y el bucket `blog` con `publico = true`, 5242880 bytes y solo tipos de imagen. Sin políticas de `anon` en `storage.objects`.
- (f) 0 filas.
- (g) Solo `blog_posts`, con 9 columnas (sin `created_by`).
- (h) Una fila: `publicado`, `visible_para_visitantes = true`, 5 artículos (tras el seed del blog).

Si algo no cuadra, no sigas hasta entender por qué.

## 2. El cliente de A no ve nada de B

Cada bloque simula la sesión de la persona de A. Sustituye los marcadores. Todos deben devolver **0 filas** para los datos de B, y solo lo de A cuando se pide lo de A.

```sql
begin;
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"UUID_A","role":"authenticated"}', true);

-- Control, debe verse algo de A.
select id, titulo from public.proyectos where id = 'PROYECTO_A';

-- Todo lo siguiente debe devolver 0 filas.
select id from public.proyectos          where empresa_id = 'EMPRESA_B';
select id from public.archivos           where empresa_id = 'EMPRESA_B';
select id from public.incidencias        where empresa_id = 'EMPRESA_B';
select id from public.presupuestos       where empresa_id = 'EMPRESA_B';
select id from public.bolsa_horas        where empresa_id = 'EMPRESA_B';
select id from public.bolsa_movimientos  where empresa_id = 'EMPRESA_B';
select id from public.documentos         where empresa_id = 'EMPRESA_B';
select id from public.hitos              where proyecto_id = 'PROYECTO_B';
select id from public.usuarios           where empresa_id = 'EMPRESA_B';

-- Sin filtro, solo debe aparecer la empresa A.
select empresa_id, count(*) from public.proyectos group by 1;
select id from public.empresas;

rollback;
```

Resultado correcto: el control devuelve su fila, los demás selects salen vacíos y los dos últimos solo muestran la empresa A.

También puedes comprobarlo en la web. Entra como `a@ejemplo.test` en `/portal` y revisa que en Proyectos, Incidencias, Presupuestos y Horas solo aparecen los datos de A. Cambiar un id en la URL (`/portal/proyecto/<id de B>`) debe dar 404.

## 3. El cliente de A no puede registrar un archivo con la ruta de B

Cinco intentos de insertar en `archivos`. **Deben fallar todos menos el 3.4, que es el control con una ruta correcta.** Un insert malicioso que funcione es un fallo de seguridad.

```sql
begin;
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"UUID_A","role":"authenticated"}', true);

-- 3.1 Ruta de B con empresa y proyecto de A.
-- Debe fallar con "new row violates row-level security policy".
insert into public.archivos
  (proyecto_id, empresa_id, nombre, tipo_mime, tamanio_bytes, storage_path, subido_por)
values ('PROYECTO_A', 'EMPRESA_A', 'robado.pdf', 'application/pdf', 1,
        'RUTA_B', 'UUID_A');
rollback;

begin;
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"UUID_A","role":"authenticated"}', true);

-- 3.2 Empresa y proyecto de B (ni siquiera es su empresa).
-- Debe fallar por RLS.
insert into public.archivos
  (proyecto_id, empresa_id, nombre, tipo_mime, tamanio_bytes, storage_path, subido_por)
values ('PROYECTO_B', 'EMPRESA_B', 'robado.pdf', 'application/pdf', 1,
        'RUTA_B', 'UUID_A');
rollback;

begin;
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"UUID_A","role":"authenticated"}', true);

-- 3.3 Empresa de A, proyecto de B. Debe fallar por RLS.
insert into public.archivos
  (proyecto_id, empresa_id, nombre, tipo_mime, tamanio_bytes, storage_path, subido_por)
values ('PROYECTO_B', 'EMPRESA_A', 'robado.pdf', 'application/pdf', 1,
        'EMPRESA_A/PROYECTO_B/x-robado.pdf', 'UUID_A');
rollback;

begin;
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"UUID_A","role":"authenticated"}', true);

-- 3.4 Control, con una ruta correcta de A el insert SÍ debe funcionar
-- (se deshace con el rollback). Si falla, la política está demasiado cerrada.
insert into public.archivos
  (proyecto_id, empresa_id, nombre, tipo_mime, tamanio_bytes, storage_path, subido_por)
values ('PROYECTO_A', 'EMPRESA_A', 'prueba.pdf', 'application/pdf', 1,
        'EMPRESA_A/PROYECTO_A/00000000-0000-4000-8000-000000000000-prueba.pdf', 'UUID_A');
rollback;
```

```sql
begin;
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"UUID_A","role":"authenticated"}', true);

-- 3.5 Ruta que empieza por la carpeta de A pero sube con ".." a la de B.
-- Debe fallar por RLS, porque la política rechaza las rutas con "..".
insert into public.archivos
  (proyecto_id, empresa_id, nombre, tipo_mime, tamanio_bytes, storage_path, subido_por)
values ('PROYECTO_A', 'EMPRESA_A', 'robado.pdf', 'application/pdf', 1,
        'EMPRESA_A/PROYECTO_A/../../EMPRESA_B/x', 'UUID_A');
rollback;
```

Sustituye `EMPRESA_A/PROYECTO_A/...` por los uuid reales, con las barras. Con el cuarto intento (3.4) como único que funciona, los intentos 3.1, 3.2, 3.3 y 3.5 deben fallar.

Para comprobar el check de la base de datos aparte de la política, hazlo como administrador (rol `postgres`, sin `set role`), que se salta RLS pero no los checks.

```sql
begin;
-- Debe fallar con 'violates check constraint "archivos_storage_path_check"'.
insert into public.archivos
  (proyecto_id, empresa_id, nombre, tipo_mime, tamanio_bytes, storage_path)
values ('PROYECTO_A', 'EMPRESA_A', 'x.pdf', 'application/pdf', 1, 'RUTA_B');
rollback;
```

### Descarga con una ruta manipulada (opcional)

`/api/storage/download` también rechaza la ruta si no empieza por `empresa_id/proyecto_id/` de la propia fila. Con el check en la base no se puede crear una fila así sin saltarse RLS, así que esta prueba solo vale si alguna vez se relaja el check. Un archivo normal debe descargarse bien desde `/portal`.

## 4. El cliente de A no puede llamar a registrar_horas

`registrar_horas` es SECURITY DEFINER y exige `is_admin()` dentro. Un cliente debe recibir `forbidden` (código 42501) y la bolsa no debe cambiar.

```sql
begin;
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"UUID_A","role":"authenticated"}', true);

-- Debe fallar con "forbidden" (42501), tanto en su propia empresa como en la de B.
select * from public.registrar_horas('EMPRESA_A', current_date, 1, null, 'prueba');
rollback;

begin;
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"UUID_A","role":"authenticated"}', true);
select * from public.registrar_horas('EMPRESA_B', current_date, 1, null, 'prueba');
rollback;
```

Después, comprueba como administrador que las horas consumidas de las dos empresas no han cambiado.

```sql
select empresa_id, horas_contratadas, horas_consumidas from public.bolsa_horas
where empresa_id in ('EMPRESA_A', 'EMPRESA_B');
```

Para confirmar que el administrador sí puede, usa la web (apuntar horas en `/admin/horas`) y no SQL, porque `is_admin()` depende de la sesión.

## 5. El blog: los visitantes solo ven lo publicado

Cada bloque crea artículos de prueba con el rol administrador (rol `postgres`, sin `set role`) y se deshace con `rollback`. Lánzalos por separado.

```sql
begin;
insert into public.blog_posts (slug, category, status, published_at, content, created_by) values
  ('prueba-publicado',  'sistemas', 'publicado', now() - interval '1 day', '{}'::jsonb, 'prueba'),
  ('prueba-programado', 'sistemas', 'publicado', now() + interval '1 day', '{}'::jsonb, 'prueba'),
  ('prueba-borrador',   'sistemas', 'borrador',  null,                     '{}'::jsonb, 'prueba');

set local role anon;

-- 5.1 Un visitante solo ve el publicado con fecha pasada.
-- Debe devolver 1 fila (prueba-publicado), sin el programado ni el borrador.
select slug from public.blog_posts where slug like 'prueba-%';
rollback;

begin;
insert into public.blog_posts (slug, category, status, published_at, content, created_by) values
  ('prueba-publicado', 'sistemas', 'publicado', now() - interval '1 day', '{}'::jsonb, 'api:secreto');
set local role anon;

-- 5.2 created_by no se puede leer como visitante.
-- Debe fallar con "permission denied for table blog_posts" (o la columna created_by).
select created_by from public.blog_posts;
rollback;

begin;
set local role anon;
-- 5.3 Un visitante no puede escribir. Debe fallar con "permission denied".
insert into public.blog_posts (slug, category, status, content, created_by)
values ('intruso', 'sistemas', 'borrador', '{}'::jsonb, 'anon');
rollback;

begin;
set local role anon;
-- 5.4 Ni leer las versiones ni las claves de la API. Cada una debe fallar con "permission denied".
select * from public.blog_post_versions;
rollback;

begin;
set local role anon;
select * from public.blog_api_tokens;
select * from public.blog_api_uso;
rollback;
```

Con una cuenta de cliente (sesión `authenticated` sin ser admin) pasa lo mismo, salvo que no hay "permission denied" sino filas vacías o un fallo de RLS:

```sql
begin;
insert into public.blog_posts (slug, category, status, published_at, content, created_by) values
  ('prueba-publicado',  'sistemas', 'publicado', now() - interval '1 day', '{}'::jsonb, 'prueba'),
  ('prueba-borrador',   'sistemas', 'borrador',  null,                     '{}'::jsonb, 'prueba');
insert into public.blog_api_tokens (nombre, token_hash) values ('prueba', 'hash-de-prueba');

set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"UUID_A","role":"authenticated"}', true);

-- 5.5 Cliente: 1 fila (solo el publicado).
select slug from public.blog_posts where slug like 'prueba-%';
-- 5.6 Cliente: 0 filas en las tres.
select id from public.blog_post_versions;
select id from public.blog_api_tokens;
select id from public.blog_api_uso;
rollback;

begin;
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"UUID_A","role":"authenticated"}', true);
-- 5.7 Cliente: no puede escribir. Debe fallar con "new row violates row-level security policy".
insert into public.blog_posts (slug, category, status, content, created_by)
values ('intruso', 'sistemas', 'borrador', '{}'::jsonb, 'cliente');
rollback;
```

Y los checks de la tabla, como administrador (los dos deben fallar):

```sql
begin;
-- 5.8 Slug con mayúsculas. Debe fallar con 'violates check constraint "blog_posts_slug_check"'.
insert into public.blog_posts (slug, category, status, content, created_by)
values ('Mayusculas', 'sistemas', 'borrador', '{}'::jsonb, 'prueba');
rollback;

begin;
-- 5.9 Publicado sin fecha. Debe fallar con 'violates check constraint "blog_posts_publicado_fecha_check"'.
insert into public.blog_posts (slug, category, status, content, created_by)
values ('sin-fecha', 'sistemas', 'publicado', '{}'::jsonb, 'prueba');
rollback;
```

Bucket `blog`: abre en el navegador la URL pública de una imagen subida (`<SUPABASE_URL>/storage/v1/object/public/blog/<slug>/<archivo>`), debe verse. Un visitante no debe poder listar el bucket: `<SUPABASE_URL>/storage/v1/object/list/blog` con solo la clave anon debe dar error o lista vacía.

## 6. Cierre

- Si todo ha salido como se describe, borra las empresas de prueba (archivar y eliminar desde la ficha).
- Si alguna prueba de "debe fallar" ha funcionado, o alguna de "0 filas" ha devuelto datos, no despliegues. Anota qué consulta fue y qué devolvió.
- Repite el paso 1 después de cada cambio en `db/rls.sql`.
