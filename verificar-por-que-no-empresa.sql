-- Verificar por qué no se insertaron datos de empresa

-- 1. VERIFICAR SI HAY DATOS EN HISTORIAL DE EMPRESAS
SELECT 
  'HISTORIAL EMPRESAS' as fuente,
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

-- 4. SIMULAR LO QUE HACE EL TRIGGER
SELECT 
  'SIMULACIÓN TRIGGER' as fuente,
  CASE 
    WHEN p.empresa_id IS NOT NULL THEN '✅ Participante tiene empresa_id'
    ELSE '❌ Participante NO tiene empresa_id'
  END as tiene_empresa,
  p.empresa_id,
  e.nombre as empresa_nombre
FROM participantes p
LEFT JOIN empresas e ON p.empresa_id = e.id
WHERE p.id = '9155b800-f786-46d7-9294-bb385434d042';

-- 5. VERIFICAR SI YA EXISTE EN HISTORIAL DE EMPRESAS
SELECT 
  'VERIFICAR DUPLICADO EMPRESA' as fuente,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM historial_participacion_empresas 
      WHERE empresa_id = '56ae11ec-f6b4-4066-9414-e51adfbebee2'
      AND reclutamiento_id = '758813f1-512e-4566-af82-bcf0915de79c'
    ) THEN '✅ Ya existe en historial'
    ELSE '❌ NO existe en historial'
  END as existe_en_historial; 