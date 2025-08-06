-- Permitir NULL en participantes_id para soportar participantes internos
SELECT '=== MODIFICANDO PARTICIPANTES_ID PARA PERMITIR NULL ===' as info;

-- Verificar estado actual
SELECT 
  column_name,
  is_nullable,
  data_type
FROM information_schema.columns 
WHERE table_name = 'reclutamientos' 
  AND table_schema = 'public'
  AND column_name IN ('participantes_id', 'participantes_internos_id')
ORDER BY column_name;

-- Modificar participantes_id para permitir NULL
ALTER TABLE reclutamientos 
ALTER COLUMN participantes_id DROP NOT NULL;

SELECT '✅ participantes_id ahora permite NULL' as resultado;

-- Verificar estado final
SELECT 
  column_name,
  is_nullable,
  data_type
FROM information_schema.columns 
WHERE table_name = 'reclutamientos' 
  AND table_schema = 'public'
  AND column_name IN ('participantes_id', 'participantes_internos_id')
ORDER BY column_name; 