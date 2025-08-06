-- Verificar estructura real de investigaciones

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

-- 3. VERIFICAR SI HAY RELACIÓN CON EMPRESAS
SELECT 
  'RELACIÓN CON EMPRESAS' as fuente,
  table_name,
  column_name,
  referenced_table_name,
  referenced_column_name
FROM information_schema.key_column_usage kcu
JOIN information_schema.table_constraints tc ON kcu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'investigaciones' 
  AND tc.constraint_type = 'FOREIGN KEY'
  AND referenced_table_name = 'empresas';

-- 4. VERIFICAR RECLUTAMIENTOS FINALIZADOS SIN EMPRESA_ID
SELECT 
  'RECLUTAMIENTOS FINALIZADOS' as fuente,
  r.id as reclutamiento_id,
  r.participantes_id,
  eac.nombre as estado,
  r.investigacion_id
FROM reclutamientos r
JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
WHERE eac.nombre = 'Finalizado'; 