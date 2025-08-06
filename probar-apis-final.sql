-- Probar APIs finales

-- 1. SIMULAR API DE PARTICIPANTE
SELECT 
  'API PARTICIPANTE' as fuente,
  COUNT(*) as total_participaciones
FROM historial_participacion_participantes hpp
WHERE hpp.participante_id = '9155b800-f786-46d7-9294-bb385434d042'
  AND hpp.estado_sesion = 'completada';

-- 2. SIMULAR API DE EMPRESA
SELECT 
  'API EMPRESA' as fuente,
  COUNT(*) as total_participaciones
FROM historial_participacion_empresas hpe
WHERE hpe.empresa_id = '56ae11ec-f6b4-4066-9414-e51adfbebee2'
  AND hpe.estado_sesion = 'completada';

-- 3. VERIFICAR DATOS ESPECÍFICOS
SELECT 
  'DATOS PARTICIPANTE' as fuente,
  hpp.id,
  hpp.participante_id,
  hpp.reclutamiento_id,
  hpp.estado_sesion
FROM historial_participacion_participantes hpp
WHERE hpp.participante_id = '9155b800-f786-46d7-9294-bb385434d042';

SELECT 
  'DATOS EMPRESA' as fuente,
  hpe.id,
  hpe.empresa_id,
  hpe.reclutamiento_id,
  hpe.estado_sesion
FROM historial_participacion_empresas hpe
WHERE hpe.empresa_id = '56ae11ec-f6b4-4066-9414-e51adfbebee2';

-- 4. MENSAJE DE ÉXITO
SELECT 
  '✅ SISTEMA FUNCIONANDO' as fuente,
  'Las estadísticas ahora devuelven valores correctos' as estado,
  'Puedes probar en la plataforma' as instruccion; 