-- Probar solo participantes (CORREGIDO)

-- 1. VERIFICAR ESTADO ANTES DE PROBAR
SELECT 
  'ESTADO ANTES DE PROBAR' as fuente,
  'Participantes' as tipo,
  COUNT(*) as total_registros
FROM historial_participacion_participantes;

-- 2. CREAR NUEVO RECLUTAMIENTO DE PRUEBA (CORREGIDO)
INSERT INTO reclutamientos (
    id,
    participantes_id,
    estado_agendamiento,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    '9155b800-f786-46d7-9294-bb385434d042',
    'Finalizado',
    NOW(),
    NOW()
);

-- 3. VERIFICAR ESTADO DESPUÉS DE CREAR
SELECT 
  'ESTADO DESPUÉS DE CREAR' as fuente,
  'Participantes' as tipo,
  COUNT(*) as total_registros
FROM historial_participacion_participantes;

-- 4. VERIFICAR QUE NO HAY DUPLICADOS
SELECT 
  'VERIFICAR DUPLICADOS PARTICIPANTES' as fuente,
  COUNT(*) as total,
  COUNT(DISTINCT participante_id::text || reclutamiento_id::text) as unicos
FROM historial_participacion_participantes;

-- 5. SIMULAR API FINAL
SELECT 
  'API PARTICIPANTE FINAL' as fuente,
  COUNT(*) as total_participaciones
FROM historial_participacion_participantes hpp
WHERE hpp.participante_id = '9155b800-f786-46d7-9294-bb385434d042'
  AND hpp.estado_sesion = 'completada';

-- 6. VER ÚLTIMOS REGISTROS CREADOS
SELECT 
  'ÚLTIMOS PARTICIPANTES' as fuente,
  participante_id,
  reclutamiento_id,
  estado_sesion,
  created_at
FROM historial_participacion_participantes
ORDER BY created_at DESC
LIMIT 3; 