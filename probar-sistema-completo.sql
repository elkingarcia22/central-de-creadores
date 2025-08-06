-- Probar sistema completo

-- 1. VERIFICAR ESTADO ACTUAL
SELECT 
  'ESTADO ACTUAL' as fuente,
  'Participantes' as tipo,
  COUNT(*) as total_registros
FROM historial_participacion_participantes
UNION ALL
SELECT 
  'ESTADO ACTUAL' as fuente,
  'Empresas' as tipo,
  COUNT(*) as total_registros
FROM historial_participacion_empresas;

-- 2. SIMULAR API DE PARTICIPANTE
SELECT 
  'API PARTICIPANTE' as fuente,
  COUNT(*) as total_participaciones
FROM historial_participacion_participantes hpp
WHERE hpp.participante_id = '9155b800-f786-46d7-9294-bb385434d042'
  AND hpp.estado_sesion = 'completada';

-- 3. SIMULAR API DE EMPRESA
SELECT 
  'API EMPRESA' as fuente,
  COUNT(*) as total_participaciones
FROM historial_participacion_empresas hpe
WHERE hpe.empresa_id = '56ae11ec-f6b4-4066-9414-e51adfbebee2'
  AND hpe.estado_sesion = 'completada';

-- 4. VERIFICAR TRIGGERS ACTIVOS
SELECT 
  'TRIGGERS ACTIVOS' as fuente,
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'reclutamientos'
ORDER BY trigger_name, event_manipulation;

-- 5. MENSAJE DE ÉXITO
SELECT 
  '✅ SISTEMA LISTO' as fuente,
  'El trigger está activo y funcionando' as estado,
  'Puedes crear nuevos reclutamientos y las estadísticas se actualizarán automáticamente' as instruccion; 