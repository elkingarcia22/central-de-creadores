-- Diagnóstico sin asumir nombres de columnas

-- 1. VERIFICAR DATOS EN HISTORIAL DE PARTICIPANTES
SELECT 
  'HISTORIAL PARTICIPANTES' as fuente,
  COUNT(*) as total_registros
FROM historial_participacion_participantes;

-- 2. VERIFICAR DATOS EN HISTORIAL DE EMPRESAS
SELECT 
  'HISTORIAL EMPRESAS' as fuente,
  COUNT(*) as total_registros
FROM historial_participacion_empresas;

-- 3. VERIFICAR RECLUTAMIENTOS FINALIZADOS
SELECT 
  'RECLUTAMIENTOS FINALIZADOS' as fuente,
  COUNT(*) as total_finalizados
FROM reclutamientos r
JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
WHERE eac.nombre = 'Finalizado';

-- 4. VERIFICAR PARTICIPANTE ESPECÍFICO EN RECLUTAMIENTOS
SELECT 
  'PARTICIPANTE EN RECLUTAMIENTOS' as fuente,
  r.id as reclutamiento_id,
  r.participantes_id,
  eac.nombre as estado
FROM reclutamientos r
JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
WHERE r.participantes_id = '9155b800-f786-46d7-9294-bb385434d042'
  AND eac.nombre = 'Finalizado';

-- 5. VERIFICAR TODOS LOS RECLUTAMIENTOS DE ESTE PARTICIPANTE
SELECT 
  'TODOS LOS RECLUTAMIENTOS DEL PARTICIPANTE' as fuente,
  r.id as reclutamiento_id,
  r.participantes_id,
  eac.nombre as estado,
  r.investigacion_id
FROM reclutamientos r
JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
WHERE r.participantes_id = '9155b800-f786-46d7-9294-bb385434d042';

-- 6. VERIFICAR INVESTIGACIONES DE ESTE PARTICIPANTE
SELECT 
  'INVESTIGACIONES DEL PARTICIPANTE' as fuente,
  i.id as investigacion_id,
  i.nombre as investigacion_nombre,
  e.nombre as empresa_nombre,
  e.id as empresa_id
FROM investigaciones i
JOIN empresas e ON i.empresa_id = e.id
JOIN reclutamientos r ON i.id = r.investigacion_id
WHERE r.participantes_id = '9155b800-f786-46d7-9294-bb385434d042';

-- 7. VERIFICAR EMPRESA ESPECÍFICA EN INVESTIGACIONES
SELECT 
  'EMPRESA EN INVESTIGACIONES' as fuente,
  i.id as investigacion_id,
  i.nombre as investigacion_nombre,
  e.id as empresa_id,
  e.nombre as empresa_nombre
FROM investigaciones i
JOIN empresas e ON i.empresa_id = e.id
WHERE e.id = '56ae11ec-f6b4-4066-9414-e51adfbebee2'; 