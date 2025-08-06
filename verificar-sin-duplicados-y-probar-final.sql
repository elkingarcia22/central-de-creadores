-- Verificar sin duplicados y probar sistema final

-- 1. VERIFICAR QUE NO HAY DUPLICADOS
SELECT 
  'VERIFICAR DUPLICADOS PARTICIPANTES' as fuente,
  COUNT(*) as total,
  COUNT(DISTINCT participante_id::text || reclutamiento_id::text) as unicos
FROM historial_participacion_participantes
UNION ALL
SELECT 
  'VERIFICAR DUPLICADOS EMPRESAS' as fuente,
  COUNT(*) as total,
  COUNT(DISTINCT empresa_id::text || reclutamiento_id::text) as unicos
FROM historial_participacion_empresas;

-- 2. VER DETALLE DE PARTICIPANTES
SELECT 
  'DETALLE PARTICIPANTES' as fuente,
  participante_id,
  reclutamiento_id,
  estado_sesion,
  created_at
FROM historial_participacion_participantes
ORDER BY created_at DESC;

-- 3. VER DETALLE DE EMPRESAS
SELECT 
  'DETALLE EMPRESAS' as fuente,
  empresa_id,
  reclutamiento_id,
  estado_sesion,
  created_at
FROM historial_participacion_empresas
ORDER BY created_at DESC;

-- 4. SIMULAR APIs FINALES
SELECT 
  'API PARTICIPANTE FINAL' as fuente,
  COUNT(*) as total_participaciones
FROM historial_participacion_participantes hpp
WHERE hpp.participante_id = '9155b800-f786-46d7-9294-bb385434d042'
  AND hpp.estado_sesion = 'completada';

SELECT 
  'API EMPRESA FINAL' as fuente,
  COUNT(*) as total_participaciones
FROM historial_participacion_empresas hpe
WHERE hpe.empresa_id = '56ae11ec-f6b4-4066-9414-e51adfbebee2'
  AND hpe.estado_sesion = 'completada';

-- 5. PROBAR CREAR NUEVO RECLUTAMIENTO
-- Simular que se crea un nuevo reclutamiento
-- (Esto debería activar los triggers automáticamente)

-- 6. VERIFICAR TRIGGERS ACTIVOS
SELECT 
  'TRIGGERS ACTIVOS' as fuente,
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'reclutamientos'
ORDER BY trigger_name; 