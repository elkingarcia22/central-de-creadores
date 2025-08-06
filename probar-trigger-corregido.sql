-- Probar trigger corregido

-- 1. VERIFICAR ESTADO ANTES DE PROBAR
SELECT 
  'ESTADO ANTES DE PROBAR' as fuente,
  'Participantes' as tipo,
  COUNT(*) as total_registros
FROM historial_participacion_participantes;

-- 2. CREAR NUEVO RECLUTAMIENTO DE PRUEBA
INSERT INTO reclutamientos (
    id,
    investigacion_id,
    participantes_id
) VALUES (
    gen_random_uuid(),
    '5a832297-4cca-4bad-abe6-3aad99b8b5f3',
    '9155b800-f786-46d7-9294-bb385434d042'
);

-- 3. VERIFICAR ESTADO DESPUÉS DE CREAR
SELECT 
  'ESTADO DESPUÉS DE CREAR' as fuente,
  'Participantes' as tipo,
  COUNT(*) as total_registros
FROM historial_participacion_participantes;

-- 4. VERIFICAR QUE NO HAY DUPLICADOS
SELECT 
  'VERIFICAR DUPLICADOS PARTICIPANTES' as fuente,
  COUNT(*) as total,
  COUNT(DISTINCT participante_id::text || reclutamiento_id::text) as unicos
FROM historial_participacion_participantes;

-- 5. VER ÚLTIMOS REGISTROS CREADOS
SELECT 
  'ÚLTIMOS PARTICIPANTES' as fuente,
  participante_id,
  reclutamiento_id,
  investigacion_id,
  estado_sesion,
  created_at
FROM historial_participacion_participantes
ORDER BY created_at DESC
LIMIT 3; 