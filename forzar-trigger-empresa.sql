-- Forzar ejecución del trigger para el reclutamiento existente

-- 1. VERIFICAR ESTADO ACTUAL
SELECT 
  'ESTADO ACTUAL' as fuente,
  r.id as reclutamiento_id,
  r.participantes_id,
  eac.nombre as estado
FROM reclutamientos r
JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
WHERE r.id = '758813f1-512e-4566-af82-bcf0915de79c';

-- 2. FORZAR EJECUCIÓN DEL TRIGGER (UPDATE para que se ejecute)
UPDATE reclutamientos 
SET updated_at = NOW()
WHERE id = '758813f1-512e-4566-af82-bcf0915de79c';

-- 3. VERIFICAR SI SE INSERTÓ EN HISTORIAL DE EMPRESAS
SELECT 
  'VERIFICAR INSERCIÓN EMPRESA' as fuente,
  COUNT(*) as total_registros
FROM historial_participacion_empresas;

-- 4. VERIFICAR DATOS INSERTADOS
SELECT 
  'DATOS INSERTADOS' as fuente,
  hpe.id,
  hpe.empresa_id,
  hpe.reclutamiento_id,
  hpe.estado_sesion
FROM historial_participacion_empresas hpe;

-- 5. SIMULAR API DE EMPRESA DESPUÉS
SELECT 
  'API EMPRESA DESPUÉS' as fuente,
  COUNT(*) as total_participaciones
FROM historial_participacion_empresas hpe
WHERE hpe.empresa_id = '56ae11ec-f6b4-4066-9414-e51adfbebee2'
  AND hpe.estado_sesion = 'completada'; 