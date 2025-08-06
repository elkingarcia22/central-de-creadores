-- Verificar triggers activos y su funcionamiento

-- 1. VERIFICAR TRIGGERS ACTIVOS
SELECT 
  'TRIGGERS ACTIVOS' as fuente,
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'reclutamientos'
ORDER BY trigger_name, event_manipulation;

-- 2. VERIFICAR FUNCIONES CREADAS
SELECT 
  'FUNCIONES CREADAS' as fuente,
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_name LIKE '%trigger%' OR routine_name LIKE '%estadisticas%'
ORDER BY routine_name;

-- 3. VERIFICAR DATOS ACTUALES EN HISTORIAL
SELECT 
  'HISTORIAL PARTICIPANTES ACTUAL' as fuente,
  COUNT(*) as total_registros,
  COUNT(DISTINCT reclutamiento_id) as reclutamientos_unicos,
  COUNT(DISTINCT participante_id) as participantes_unicos
FROM historial_participacion_participantes;

-- 4. VERIFICAR DUPLICADOS ACTUALES
SELECT 
  'DUPLICADOS ACTUALES' as fuente,
  participante_id,
  reclutamiento_id,
  COUNT(*) as cantidad_duplicados
FROM historial_participacion_participantes
GROUP BY participante_id, reclutamiento_id
HAVING COUNT(*) > 1
ORDER BY cantidad_duplicados DESC;

-- 5. VERIFICAR ÚLTIMOS RECLUTAMIENTOS CREADOS
SELECT 
  'ÚLTIMOS RECLUTAMIENTOS' as fuente,
  r.id as reclutamiento_id,
  r.participantes_id,
  eac.nombre as estado,
  r.updated_at
FROM reclutamientos r
JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
ORDER BY r.updated_at DESC
LIMIT 5; 