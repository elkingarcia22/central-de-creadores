-- Verificar datos actuales y probar el trigger

-- 1. VERIFICAR DATOS ACTUALES EN HISTORIAL
SELECT 
  'HISTORIAL PARTICIPANTES ACTUAL' as fuente,
  COUNT(*) as total_registros
FROM historial_participacion_participantes;

SELECT 
  'HISTORIAL EMPRESAS ACTUAL' as fuente,
  COUNT(*) as total_registros
FROM historial_participacion_empresas;

-- 2. VERIFICAR PARTICIPANTE Y SU EMPRESA
SELECT 
  'PARTICIPANTE Y EMPRESA' as fuente,
  p.id as participante_id,
  p.nombre as participante_nombre,
  p.empresa_id,
  e.nombre as empresa_nombre
FROM participantes p
JOIN empresas e ON p.empresa_id = e.id
WHERE p.id = '9155b800-f786-46d7-9294-bb385434d042';

-- 3. VERIFICAR RECLUTAMIENTO ACTUAL
SELECT 
  'RECLUTAMIENTO ACTUAL' as fuente,
  r.id as reclutamiento_id,
  r.participantes_id,
  eac.nombre as estado
FROM reclutamientos r
JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
WHERE r.id = '758813f1-512e-4566-af82-bcf0915de79c';

-- 4. SIMULAR API DE EMPRESA
SELECT 
  'API EMPRESA SIMULADA' as fuente,
  COUNT(*) as total_participaciones
FROM historial_participacion_empresas hpe
WHERE hpe.empresa_id = '56ae11ec-f6b4-4066-9414-e51adfbebee2'
  AND hpe.estado_sesion = 'completada';

-- 5. VERIFICAR SI HAY DATOS EN HISTORIAL DE EMPRESAS
SELECT 
  'DATOS EN HISTORIAL EMPRESAS' as fuente,
  hpe.id,
  hpe.empresa_id,
  hpe.reclutamiento_id,
  hpe.estado_sesion
FROM historial_participacion_empresas hpe; 