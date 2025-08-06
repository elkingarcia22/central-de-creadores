-- Verificar duplicación actual

-- 1. VERIFICAR DATOS EN HISTORIAL DE PARTICIPANTES
SELECT 
  'HISTORIAL PARTICIPANTES' as fuente,
  COUNT(*) as total_registros,
  COUNT(DISTINCT reclutamiento_id) as reclutamientos_unicos,
  COUNT(DISTINCT participante_id) as participantes_unicos
FROM historial_participacion_participantes;

-- 2. VERIFICAR DATOS EN HISTORIAL DE EMPRESAS
SELECT 
  'HISTORIAL EMPRESAS' as fuente,
  COUNT(*) as total_registros,
  COUNT(DISTINCT reclutamiento_id) as reclutamientos_unicos,
  COUNT(DISTINCT empresa_id) as empresas_unicas
FROM historial_participacion_empresas;

-- 3. VERIFICAR DUPLICADOS EN PARTICIPANTES
SELECT 
  'DUPLICADOS PARTICIPANTES' as fuente,
  participante_id,
  reclutamiento_id,
  COUNT(*) as cantidad_duplicados
FROM historial_participacion_participantes
GROUP BY participante_id, reclutamiento_id
HAVING COUNT(*) > 1
ORDER BY cantidad_duplicados DESC;

-- 4. VERIFICAR DUPLICADOS EN EMPRESAS
SELECT 
  'DUPLICADOS EMPRESAS' as fuente,
  empresa_id,
  reclutamiento_id,
  COUNT(*) as cantidad_duplicados
FROM historial_participacion_empresas
GROUP BY empresa_id, reclutamiento_id
HAVING COUNT(*) > 1
ORDER BY cantidad_duplicados DESC;

-- 5. VERIFICAR DATOS ESPECÍFICOS
SELECT 
  'DATOS ESPECÍFICOS' as fuente,
  hpp.id as historial_participante_id,
  hpp.participante_id,
  hpp.reclutamiento_id,
  hpp.estado_sesion,
  hpe.id as historial_empresa_id,
  hpe.empresa_id,
  hpe.reclutamiento_id as empresa_reclutamiento_id
FROM historial_participacion_participantes hpp
LEFT JOIN historial_participacion_empresas hpe ON hpp.reclutamiento_id = hpe.reclutamiento_id
WHERE hpp.participante_id = '9155b800-f786-46d7-9294-bb385434d042'; 