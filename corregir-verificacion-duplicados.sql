-- Corregir verificación de duplicados (UUID concatenation error)

-- 1. VERIFICAR QUE NO HAY DUPLICADOS (CORREGIDO)
SELECT 
  'VERIFICAR DUPLICADOS PARTICIPANTES' as fuente,
  COUNT(*) as total,
  COUNT(DISTINCT participante_id::text || reclutamiento_id::text) as unicos
FROM historial_participacion_participantes
UNION ALL
SELECT 
  'VERIFICAR DUPLICADOS EMPRESAS' as fuente,
  COUNT(*) as total,
  COUNT(DISTINCT empresa_id::text || reclutamiento_id::text) as unicos
FROM historial_participacion_empresas;

-- 2. SIMULAR APIs FINALES
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

-- 3. VERIFICAR ESTADO FINAL
SELECT 
  'ESTADO FINAL' as fuente,
  'Participantes' as tipo,
  COUNT(*) as total_registros
FROM historial_participacion_participantes
UNION ALL
SELECT 
  'ESTADO FINAL' as fuente,
  'Empresas' as tipo,
  COUNT(*) as total_registros
FROM historial_participacion_empresas; 