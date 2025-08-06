-- Probar sistema completo final (CORREGIDO)

-- 1. VERIFICAR ESTADO ANTES DE PROBAR
SELECT 
  'ESTADO ANTES DE PROBAR' as fuente,
  'Participantes' as tipo,
  COUNT(*) as total_registros
FROM historial_participacion_participantes
UNION ALL
SELECT 
  'ESTADO ANTES DE PROBAR' as fuente,
  'Empresas' as tipo,
  COUNT(*) as total_registros
FROM historial_participacion_empresas;

-- 2. CREAR NUEVO RECLUTAMIENTO DE PRUEBA (CORREGIDO)
INSERT INTO reclutamientos (
    id,
    participantes_id,
    empresa_id,
    estado_sesion,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    '9155b800-f786-46d7-9294-bb385434d042',
    '56ae11ec-f6b4-4066-9414-e51adfbebee2',
    'completada',
    NOW(),
    NOW()
);

-- 3. VERIFICAR ESTADO DESPUÉS DE CREAR
SELECT 
  'ESTADO DESPUÉS DE CREAR' as fuente,
  'Participantes' as tipo,
  COUNT(*) as total_registros
FROM historial_participacion_participantes
UNION ALL
SELECT 
  'ESTADO DESPUÉS DE CREAR' as fuente,
  'Empresas' as tipo,
  COUNT(*) as total_registros
FROM historial_participacion_empresas;

-- 4. VERIFICAR QUE NO HAY DUPLICADOS
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

-- 5. SIMULAR APIs FINALES
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

-- 6. VER ÚLTIMOS REGISTROS CREADOS
SELECT 
  'ÚLTIMOS PARTICIPANTES' as fuente,
  participante_id,
  reclutamiento_id,
  estado_sesion,
  created_at
FROM historial_participacion_participantes
ORDER BY created_at DESC
LIMIT 3;

SELECT 
  'ÚLTIMAS EMPRESAS' as fuente,
  empresa_id,
  reclutamiento_id,
  estado_sesion,
  created_at
FROM historial_participacion_empresas
ORDER BY created_at DESC
LIMIT 3; 