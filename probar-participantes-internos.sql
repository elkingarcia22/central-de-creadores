-- Probar participantes internos

-- 1. VERIFICAR ESTADO ANTES DE PROBAR
SELECT 
  'ESTADO ANTES DE PROBAR' as fuente,
  'Participantes Internos' as tipo,
  COUNT(*) as total_registros
FROM historial_participacion_participantes_internos;

-- 2. VER PARTICIPANTES INTERNOS DISPONIBLES
SELECT 
    id,
    nombre,
    apellido
FROM participantes_internos 
LIMIT 3;

-- 3. CREAR NUEVO RECLUTAMIENTO CON PARTICIPANTE INTERNO
INSERT INTO reclutamientos (
    id,
    investigacion_id,
    participantes_internos_id,
    tipo_participante,
    fecha_asignado,
    reclutador_id,
    creado_por,
    estado_agendamiento
) VALUES (
    gen_random_uuid(),
    '5a832297-4cca-4bad-abe6-3aad99b8b5f3',
    (SELECT id FROM participantes_internos LIMIT 1),
    'interno',
    NOW(),
    'bea59fc5-812f-4b71-8228-a50ffc85c2e8',
    'bea59fc5-812f-4b71-8228-a50ffc85c2e8',
    NULL
);

-- 4. VERIFICAR ESTADO DESPUÉS DE CREAR
SELECT 
  'ESTADO DESPUÉS DE CREAR' as fuente,
  'Participantes Internos' as tipo,
  COUNT(*) as total_registros
FROM historial_participacion_participantes_internos;

-- 5. VERIFICAR QUE NO HAY DUPLICADOS
SELECT 
  'VERIFICAR DUPLICADOS INTERNOS' as fuente,
  COUNT(*) as total,
  COUNT(DISTINCT participante_interno_id::text || reclutamiento_id::text) as unicos
FROM historial_participacion_participantes_internos;

-- 6. VER ÚLTIMOS REGISTROS CREADOS
SELECT 
  'ÚLTIMOS INTERNOS' as fuente,
  participante_interno_id,
  reclutamiento_id,
  investigacion_id,
  estado_sesion,
  created_at
FROM historial_participacion_participantes_internos
ORDER BY created_at DESC
LIMIT 3;

-- 7. VERIFICAR RECLUTAMIENTO CREADO
SELECT 
  'RECLUTAMIENTO INTERNO CREADO' as fuente,
  id,
  investigacion_id,
  participantes_internos_id,
  tipo_participante,
  estado_agendamiento
FROM reclutamientos 
WHERE participantes_internos_id IS NOT NULL
ORDER BY created_at DESC
LIMIT 1; 