-- Probar sistema con usuario válido

-- 1. VERIFICAR ESTADO ANTES DE PROBAR
SELECT 
  'ESTADO ANTES DE PROBAR' as fuente,
  'Participantes' as tipo,
  COUNT(*) as total_registros
FROM historial_participacion_participantes;

-- 2. CREAR NUEVO RECLUTAMIENTO DE PRUEBA (CON USUARIO VÁLIDO)
INSERT INTO reclutamientos (
    id,
    investigacion_id,
    participantes_id,
    tipo_participante,
    fecha_asignado,
    reclutador_id,
    creado_por,
    estado_agendamiento
) VALUES (
    gen_random_uuid(),
    '5a832297-4cca-4bad-abe6-3aad99b8b5f3',
    '9155b800-f786-46d7-9294-bb385434d042',
    'externo',
    NOW(),
    'bea59fc5-812f-4b71-8228-a50ffc85c2e8',
    'bea59fc5-812f-4b71-8228-a50ffc85c2e8',
    NULL
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
  investigacion_id,
  estado_sesion,
  created_at
FROM historial_participacion_participantes
ORDER BY created_at DESC
LIMIT 3;

-- 7. VERIFICAR RECLUTAMIENTO CREADO
SELECT 
  'RECLUTAMIENTO CREADO' as fuente,
  id,
  investigacion_id,
  participantes_id,
  tipo_participante,
  estado_agendamiento
FROM reclutamientos 
WHERE participantes_id = '9155b800-f786-46d7-9294-bb385434d042'
ORDER BY created_at DESC
LIMIT 1; 