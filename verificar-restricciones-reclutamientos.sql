-- Verificar restricciones NOT NULL en la tabla reclutamientos
SELECT '=== RESTRICCIONES NOT NULL EN RECLUTAMIENTOS ===' as info;

SELECT 
  column_name,
  is_nullable,
  data_type,
  column_default
FROM information_schema.columns 
WHERE table_name = 'reclutamientos' 
  AND table_schema = 'public'
  AND is_nullable = 'NO'
ORDER BY ordinal_position;

SELECT '=== TODAS LAS COLUMNAS DE RECLUTAMIENTOS ===' as info;

SELECT 
  column_name,
  is_nullable,
  data_type,
  column_default
FROM information_schema.columns 
WHERE table_name = 'reclutamientos' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT '=== VERIFICAR SI PARTICIPANTES_ID TIENE NOT NULL ===' as info;

SELECT 
  column_name,
  is_nullable,
  data_type
FROM information_schema.columns 
WHERE table_name = 'reclutamientos' 
  AND table_schema = 'public'
  AND column_name = 'participantes_id'; 