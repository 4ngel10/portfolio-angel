-- Endurece los buckets de Storage con una lista blanca de tipos MIME. Repetible.
-- Se lanza en el SQL Editor de Supabase. La lista de "archivos" debe coincidir con
-- TIPOS_PERMITIDOS de lib/portal/storage-limits.ts; la de "finanzas" con la de
-- app/api/finanzas/justificante/route.ts.
-- Comprobación: select id, public, file_size_limit, allowed_mime_types from storage.buckets;

update storage.buckets
set allowed_mime_types = array[
  'application/pdf','application/zip','application/json','text/plain','text/csv',
  'image/png','image/jpeg','image/webp','image/gif','image/heic','image/heif','image/tiff',
  'video/mp4','video/quicktime','video/webm',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation'
]
where id = 'archivos';

update storage.buckets
set allowed_mime_types = array['application/pdf','image/jpeg','image/png','image/webp']
where id = 'finanzas';
