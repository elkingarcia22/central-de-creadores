-- Verificar relaciones entre tablas

-- 1. Verificar claves foráneas en la tabla reclutamientos
SELECT 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM 
  information_schema.table_constraints AS tc 
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'reclutamientos';

-- 2. Verificar si existe una relación directa
SELECT 
  'RELACION_DIRECTA' as tipo,
  r.id as reclutamiento_id,
  r.investigacion_id,
  i.id as investigacion_real_id,
  i.nombre as investigacion_nombre
FROM public.reclutamientos r
LEFT JOIN public.investigaciones i ON r.investigacion_id = i.id
LIMIT 5;

-- 3. Verificar si los IDs de investigacion en reclutamientos existen en investigaciones
SELECT 
  'INVESTIGACIONES_FALTANTES' as tipo,
  r.investigacion_id,
  COUNT(*) as cantidad_reclutamientos
FROM public.reclutamientos r
LEFT JOIN public.investigaciones i ON r.investigacion_id = i.id
WHERE i.id IS NULL
GROUP BY r.investigacion_id;

-- 4. Verificar si los IDs de investigacion en reclutamientos existen en investigaciones
SELECT 
  'INVESTIGACIONES_EXISTENTES' as tipo,
  r.investigacion_id,
  i.nombre,
  COUNT(*) as cantidad_reclutamientos
FROM public.reclutamientos r
INNER JOIN public.investigaciones i ON r.investigacion_id = i.id
GROUP BY r.investigacion_id, i.nombre
LIMIT 5;
