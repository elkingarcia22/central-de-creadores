-- Verificar historial internos final

-- 1. VERIFICAR ESTADO FINAL DEL HISTORIAL
SELECT 
  'ESTADO FINAL HISTORIAL' as fuente,
  'Participantes Internos' as tipo,
  COUNT(*) as total_registros
FROM historial_participacion_participantes_internos;

-- 2. VER DETALLE DEL HISTORIAL
SELECT 
  'DETALLE HISTORIAL' as fuente,
  participante_interno_id,
  investigacion_id,
  estado_sesion,
  created_at
FROM historial_participacion_participantes_internos
ORDER BY created_at DESC;

-- 3. VERIFICAR QUE NO HAY DUPLICADOS
SELECT 
  'VERIFICAR DUPLICADOS FINAL' as fuente,
  COUNT(*) as total,
  COUNT(DISTINCT participante_interno_id::text || investigacion_id::text) as unicos
FROM historial_participacion_participantes_internos;

-- 4. SIMULAR API FINAL
SELECT 
  'API PARTICIPANTE INTERNO FINAL' as fuente,
  COUNT(*) as total_participaciones
FROM historial_participacion_participantes_internos hpi
WHERE hpi.participante_interno_id = 'af4eb891-2a6e-44e0-84d3-b00592775c08'
  AND hpi.estado_sesion = 'pendiente';

-- 5. VERIFICAR TRIGGERS ACTIVOS
SELECT 
  'TRIGGERS ACTIVOS' as fuente,
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'reclutamientos'
ORDER BY trigger_name; 