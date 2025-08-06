-- Limpiar duplicados y probar triggers independientes

-- 1. LIMPIAR DUPLICADOS DE PARTICIPANTES
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

-- 2. LIMPIAR DUPLICADOS DE EMPRESAS
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

-- 3. VERIFICAR ESTADO DESPUÉS DE LIMPIAR
SELECT 
  'ESTADO DESPUÉS DE LIMPIAR' as fuente,
  'Participantes' as tipo,
  COUNT(*) as total_registros
FROM historial_participacion_participantes
UNION ALL
SELECT 
  'ESTADO DESPUÉS DE LIMPIAR' as fuente,
  'Empresas' as tipo,
  COUNT(*) as total_registros
FROM historial_participacion_empresas;

-- 4. PROBAR TRIGGERS INDEPENDIENTES
UPDATE reclutamientos 
SET updated_at = NOW()
WHERE id = 'e9c813e3-deda-4cd4-bfc2-50a02101ef80';

-- 5. VERIFICAR RESULTADO DESPUÉS DE PROBAR
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