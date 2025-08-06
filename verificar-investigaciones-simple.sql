-- Verificar estructura de investigaciones de forma simple

-- 1. ESTRUCTURA DE INVESTIGACIONES
SELECT 
  'ESTRUCTURA INVESTIGACIONES' as fuente,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'investigaciones'
ORDER BY ordinal_position;

-- 2. VERIFICAR DATOS EN INVESTIGACIONES
SELECT 
  'DATOS EN INVESTIGACIONES' as fuente,
  id,
  nombre
FROM investigaciones 
LIMIT 5;

-- 3. VERIFICAR RECLUTAMIENTOS FINALIZADOS
SELECT 
  'RECLUTAMIENTOS FINALIZADOS' as fuente,
  r.id as reclutamiento_id,
  r.participantes_id,
  eac.nombre as estado,
  r.investigacion_id
FROM reclutamientos r
JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
WHERE eac.nombre = 'Finalizado';

-- 4. VERIFICAR SI EXISTE COLUMNA EMPRESA_ID
SELECT 
  'VERIFICAR EMPRESA_ID' as fuente,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'investigaciones' AND column_name = 'empresa_id'
    ) THEN '✅ Existe empresa_id'
    ELSE '❌ NO existe empresa_id'
  END as resultado; 