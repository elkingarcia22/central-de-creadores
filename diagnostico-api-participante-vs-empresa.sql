-- Diagnóstico: ¿Por qué participante devuelve 2 y empresa devuelve 1?

-- 1. VERIFICAR DATOS EN HISTORIAL DE PARTICIPANTES
SELECT 
  'HISTORIAL PARTICIPANTES' as fuente,
  COUNT(*) as total_registros,
  COUNT(DISTINCT reclutamiento_id) as reclutamientos_unicos,
  COUNT(DISTINCT participante_id) as participantes_unicos
FROM historial_participacion_participantes;

-- 2. VERIFICAR DATOS EN HISTORIAL DE EMPRESAS
SELECT 
  'HISTORIAL EMPRESAS' as fuente,
  COUNT(*) as total_registros,
  COUNT(DISTINCT reclutamiento_id) as reclutamientos_unicos,
  COUNT(DISTINCT empresa_id) as empresas_unicas
FROM historial_participacion_empresas;

-- 3. VERIFICAR RECLUTAMIENTOS FINALIZADOS
SELECT 
  'RECLUTAMIENTOS FINALIZADOS' as fuente,
  COUNT(*) as total_finalizados,
  COUNT(DISTINCT participantes_id) as participantes_unicos,
  COUNT(DISTINCT empresa_id) as empresas_unicas
FROM reclutamientos r
JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
WHERE eac.nombre = 'Finalizado';

-- 4. VERIFICAR PARTICIPANTE ESPECÍFICO
SELECT 
  'PARTICIPANTE ESPECÍFICO' as fuente,
  r.id as reclutamiento_id,
  r.participantes_id,
  r.empresa_id,
  eac.nombre as estado,
  hpp.id as historial_id
FROM reclutamientos r
JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
LEFT JOIN historial_participacion_participantes hpp ON r.id = hpp.reclutamiento_id
WHERE r.participantes_id = '9155b800-f786-46d7-9294-bb385434d042'
  AND eac.nombre = 'Finalizado';

-- 5. VERIFICAR EMPRESA ESPECÍFICA
SELECT 
  'EMPRESA ESPECÍFICA' as fuente,
  r.id as reclutamiento_id,
  r.participantes_id,
  r.empresa_id,
  eac.nombre as estado,
  hpe.id as historial_id
FROM reclutamientos r
JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
LEFT JOIN historial_participacion_empresas hpe ON r.id = hpe.reclutamiento_id
WHERE r.empresa_id = '56ae11ec-f6b4-4066-9414-e51adfbebee2'
  AND eac.nombre = 'Finalizado';

-- 6. SIMULAR API DE PARTICIPANTE
SELECT 
  'API PARTICIPANTE' as fuente,
  COUNT(*) as total_participaciones
FROM historial_participacion_participantes hpp
WHERE hpp.participante_id = '9155b800-f786-46d7-9294-bb385434d042'
  AND hpp.estado_sesion = 'completada';

-- 7. SIMULAR API DE EMPRESA
SELECT 
  'API EMPRESA' as fuente,
  COUNT(*) as total_participaciones
FROM historial_participacion_empresas hpe
WHERE hpe.empresa_id = '56ae11ec-f6b4-4066-9414-e51adfbebee2'
  AND hpe.estado_sesion = 'completada'; 