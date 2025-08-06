-- Ejecutar estas consultas UNA POR UNA

-- CONSULTA 1: Historial participantes total
SELECT 
  'HISTORIAL PARTICIPANTES TOTAL' as fuente,
  COUNT(*) as total_registros
FROM historial_participacion_participantes;

-- CONSULTA 2: Historial empresas total
SELECT 
  'HISTORIAL EMPRESAS TOTAL' as fuente,
  COUNT(*) as total_registros
FROM historial_participacion_empresas;

-- CONSULTA 3: Reclutamientos finalizados
SELECT 
  'RECLUTAMIENTOS FINALIZADOS' as fuente,
  COUNT(*) as total_finalizados
FROM reclutamientos r
JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
WHERE eac.nombre = 'Finalizado';

-- CONSULTA 4: Participante específico en reclutamientos finalizados
SELECT 
  'PARTICIPANTE EN RECLUTAMIENTOS FINALIZADOS' as fuente,
  r.id as reclutamiento_id,
  r.participantes_id,
  eac.nombre as estado
FROM reclutamientos r
JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
WHERE r.participantes_id = '9155b800-f786-46d7-9294-bb385434d042'
  AND eac.nombre = 'Finalizado';

-- CONSULTA 5: Todos los reclutamientos del participante
SELECT 
  'TODOS LOS RECLUTAMIENTOS DEL PARTICIPANTE' as fuente,
  r.id as reclutamiento_id,
  r.participantes_id,
  eac.nombre as estado,
  r.investigacion_id
FROM reclutamientos r
JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
WHERE r.participantes_id = '9155b800-f786-46d7-9294-bb385434d042';

-- CONSULTA 6: Historial participantes específico
SELECT 
  'HISTORIAL PARTICIPANTES ESPECÍFICO' as fuente,
  hpp.id,
  hpp.participante_id,
  hpp.reclutamiento_id,
  hpp.estado_sesion
FROM historial_participacion_participantes hpp
WHERE hpp.participante_id = '9155b800-f786-46d7-9294-bb385434d042';

-- CONSULTA 7: Historial empresas específico
SELECT 
  'HISTORIAL EMPRESAS ESPECÍFICO' as fuente,
  hpe.id,
  hpe.empresa_id,
  hpe.reclutamiento_id,
  hpe.estado_sesion
FROM historial_participacion_empresas hpe
WHERE hpe.empresa_id = '56ae11ec-f6b4-4066-9414-e51adfbebee2'; 