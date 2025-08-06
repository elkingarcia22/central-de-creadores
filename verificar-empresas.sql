-- Verificar por qué las empresas dejaron de contar

-- 1. VERIFICAR DATOS EN HISTORIAL DE EMPRESAS
SELECT 
  'HISTORIAL EMPRESAS ACTUAL' as fuente,
  COUNT(*) as total_registros
FROM historial_participacion_empresas;

-- 2. VERIFICAR RECLUTAMIENTOS FINALIZADOS
SELECT 
  'RECLUTAMIENTOS FINALIZADOS' as fuente,
  r.id as reclutamiento_id,
  r.participantes_id,
  eac.nombre as estado,
  i.empresa_id
FROM reclutamientos r
JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
JOIN investigaciones i ON r.investigacion_id = i.id
WHERE eac.nombre = 'Finalizado';

-- 3. VERIFICAR SI EXISTE EMPRESA_ID EN INVESTIGACIONES
SELECT 
  'INVESTIGACIONES CON EMPRESA' as fuente,
  i.id as investigacion_id,
  i.nombre as investigacion_nombre,
  i.empresa_id,
  e.nombre as empresa_nombre
FROM investigaciones i
JOIN empresas e ON i.empresa_id = e.id
WHERE i.id IN (
  SELECT investigacion_id FROM reclutamientos r
  JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
  WHERE eac.nombre = 'Finalizado'
);

-- 4. VERIFICAR LOGS DEL TRIGGER
SELECT 
  'LOGS DEL TRIGGER' as fuente,
  log_time,
  message
FROM pg_stat_activity 
WHERE message LIKE '%Insertada empresa%' OR message LIKE '%Insertado participante%'
ORDER BY log_time DESC
LIMIT 10; 