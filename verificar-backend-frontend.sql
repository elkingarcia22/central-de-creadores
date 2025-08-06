-- Verificar backend vs frontend

-- 1. VERIFICAR BACKEND - API PARTICIPANTE
SELECT 
  'BACKEND API PARTICIPANTE' as fuente,
  COUNT(*) as total_participaciones
FROM historial_participacion_participantes hpp
WHERE hpp.participante_id = '9155b800-f786-46d7-9294-bb385434d042'
  AND hpp.estado_sesion = 'completada';

-- 2. VERIFICAR BACKEND - API EMPRESA
SELECT 
  'BACKEND API EMPRESA' as fuente,
  COUNT(*) as total_participaciones
FROM historial_participacion_empresas hpe
WHERE hpe.empresa_id = '56ae11ec-f6b4-4066-9414-e51adfbebee2'
  AND hpe.estado_sesion = 'completada';

-- 3. VERIFICAR SI HAY DATOS RESIDUALES
SELECT 
  'DATOS RESIDUALES PARTICIPANTES' as fuente,
  COUNT(*) as total_registros
FROM historial_participacion_participantes;

SELECT 
  'DATOS RESIDUALES EMPRESAS' as fuente,
  COUNT(*) as total_registros
FROM historial_participacion_empresas;

-- 4. VERIFICAR VISTAS (SI EXISTEN)
SELECT 
  'VISTAS EXISTENTES' as fuente,
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_name LIKE '%estadisticas%'
ORDER BY table_name;

-- 5. INSTRUCCIONES PARA FRONTEND
SELECT 
  'INSTRUCCIONES FRONTEND' as fuente,
  '1. Limpiar cache del navegador (Ctrl+Shift+R)' as paso1,
  '2. Verificar en DevTools -> Network si las APIs devuelven 1' as paso2,
  '3. Verificar en DevTools -> Console si hay errores' as paso3,
  '4. Verificar si el componente se renderiza múltiples veces' as paso4; 