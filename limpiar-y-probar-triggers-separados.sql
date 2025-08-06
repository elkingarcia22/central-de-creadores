-- Limpiar y probar triggers completamente separados

-- 1. LIMPIAR DUPLICADOS EXISTENTES
DELETE FROM historial_participacion_participantes 
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY participante_id, reclutamiento_id 
             ORDER BY created_at DESC
           ) as rn
    FROM historial_participacion_participantes
  ) t
  WHERE t.rn > 1
);

DELETE FROM historial_participacion_empresas 
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY empresa_id, reclutamiento_id 
             ORDER BY created_at DESC
           ) as rn
    FROM historial_participacion_empresas
  ) t
  WHERE t.rn > 1
);

-- 2. VERIFICAR ESTADO INICIAL
SELECT 
  'ESTADO INICIAL' as fuente,
  'Participantes' as tipo,
  COUNT(*) as total_registros
FROM historial_participacion_participantes
UNION ALL
SELECT 
  'ESTADO INICIAL' as fuente,
  'Empresas' as tipo,
  COUNT(*) as total_registros
FROM historial_participacion_empresas;

-- 3. PROBAR TRIGGERS SEPARADOS
UPDATE reclutamientos 
SET updated_at = NOW()
WHERE id = 'e9c813e3-deda-4cd4-bfc2-50a02101ef80';

-- 4. VERIFICAR RESULTADO
SELECT 
  'RESULTADO DESPUÉS DE PROBAR' as fuente,
  'Participantes' as tipo,
  COUNT(*) as total_registros
FROM historial_participacion_participantes
UNION ALL
SELECT 
  'RESULTADO DESPUÉS DE PROBAR' as fuente,
  'Empresas' as tipo,
  COUNT(*) as total_registros
FROM historial_participacion_empresas;

-- 5. VERIFICAR QUE NO HAY DUPLICADOS
SELECT 
  'VERIFICAR DUPLICADOS PARTICIPANTES' as fuente,
  COUNT(*) as total,
  COUNT(DISTINCT participante_id || reclutamiento_id) as unicos
FROM historial_participacion_participantes
UNION ALL
SELECT 
  'VERIFICAR DUPLICADOS EMPRESAS' as fuente,
  COUNT(*) as total,
  COUNT(DISTINCT empresa_id || reclutamiento_id) as unicos
FROM historial_participacion_empresas;

-- 6. SIMULAR APIs FINALES
SELECT 
  'API PARTICIPANTE FINAL' as fuente,
  COUNT(*) as total_participaciones
FROM historial_participacion_participantes hpp
WHERE hpp.participante_id = '9155b800-f786-46d7-9294-bb385434d042'
  AND hpp.estado_sesion = 'completada';

SELECT 
  'API EMPRESA FINAL' as fuente,
  COUNT(*) as total_participaciones
FROM historial_participacion_empresas hpe
WHERE hpe.empresa_id = '56ae11ec-f6b4-4066-9414-e51adfbebee2'
  AND hpe.estado_sesion = 'completada'; 