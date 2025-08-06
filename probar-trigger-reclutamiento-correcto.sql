-- Probar trigger con reclutamiento correcto

-- 1. VERIFICAR ESTADO DEL RECLUTAMIENTO CORRECTO
SELECT 
  'RECLUTAMIENTO CORRECTO' as fuente,
  r.id as reclutamiento_id,
  r.participantes_id,
  eac.nombre as estado,
  r.updated_at
FROM reclutamientos r
JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
WHERE r.id = 'e9c813e3-deda-4cd4-bfc2-50a02101ef80';

-- 2. VERIFICAR PARTICIPANTE Y EMPRESA
SELECT 
  'PARTICIPANTE Y EMPRESA' as fuente,
  p.id as participante_id,
  p.nombre as participante_nombre,
  p.empresa_id,
  e.nombre as empresa_nombre
FROM participantes p
JOIN empresas e ON p.empresa_id = e.id
WHERE p.id = '9155b800-f786-46d7-9294-bb385434d042';

-- 3. EJECUTAR TRIGGER CON RECLUTAMIENTO CORRECTO
UPDATE reclutamientos 
SET updated_at = NOW()
WHERE id = 'e9c813e3-deda-4cd4-bfc2-50a02101ef80';

-- 4. VERIFICAR RESULTADO
SELECT 
  'RESULTADO TRIGGER' as fuente,
  COUNT(*) as total_registros
FROM historial_participacion_empresas;

-- 5. VERIFICAR DATOS INSERTADOS
SELECT 
  'DATOS INSERTADOS' as fuente,
  hpe.id,
  hpe.empresa_id,
  hpe.reclutamiento_id,
  hpe.estado_sesion
FROM historial_participacion_empresas hpe;

-- 6. SIMULAR API DE EMPRESA
SELECT 
  'API EMPRESA SIMULADA' as fuente,
  COUNT(*) as total_participaciones
FROM historial_participacion_empresas hpe
WHERE hpe.empresa_id = '56ae11ec-f6b4-4066-9414-e51adfbebee2'
  AND hpe.estado_sesion = 'completada'; 