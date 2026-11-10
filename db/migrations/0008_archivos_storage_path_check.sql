-- Aislamiento entre clientes: la ruta de Storage de cada archivo tiene que ser
-- <empresa_id>/<proyecto_id>/<resto> y no puede contener "..". Así una fila de `archivos`
-- no puede apuntar al objeto de otra empresa, ni siquiera si alguien se salta la API.
--
-- Paso previo. Si hay filas que no cumplen, la migración se detiene y las lista en el error.
-- Para revisarlas antes de lanzar nada, ejecuta este select por separado (debe devolver 0 filas):
--
--   select id, empresa_id, proyecto_id, storage_path
--   from public.archivos
--   where storage_path not like empresa_id::text || '/' || proyecto_id::text || '/%'
--      or storage_path like '%..%';
--
-- Si devuelve filas, corrige o borra esas filas (y su objeto en Storage) antes de seguir.
DO $$
DECLARE
  n integer;
  ejemplos text;
BEGIN
  SELECT count(*), string_agg(id::text || ' (' || storage_path || ')', E'\n' ORDER BY created_at)
    INTO n, ejemplos
  FROM (
    SELECT id, storage_path, created_at
    FROM public.archivos
    WHERE storage_path NOT LIKE empresa_id::text || '/' || proyecto_id::text || '/%'
       OR storage_path LIKE '%..%'
    LIMIT 20
  ) f;
  IF n > 0 THEN
    RAISE EXCEPTION E'Hay archivos cuya storage_path no empieza por empresa_id/proyecto_id/ o contiene ".." (primeros 20):\n%', ejemplos;
  END IF;
END $$;--> statement-breakpoint
ALTER TABLE "archivos" ADD CONSTRAINT "archivos_storage_path_check" CHECK ("archivos"."storage_path" like "archivos"."empresa_id"::text || '/' || "archivos"."proyecto_id"::text || '/%' and "archivos"."storage_path" not like '%..%');
