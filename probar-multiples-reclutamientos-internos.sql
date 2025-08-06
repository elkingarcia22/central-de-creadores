-- Probar múltiples reclutamientos del mismo participante interno

-- 1. VERIFICAR ESTADO ANTES DE PROBAR
SELECT 
  'ESTADO ANTES DE PROBAR' as fuente,
  'Participantes Internos' as tipo,
  COUNT(*) as total_registros
FROM historial_participacion_participantes_internos;

-- 2. CREAR PRIMER RECLUTAMIENTO
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
    'af4eb891-2a6e-44e0-84d3-b00592775c08',
    'interno',
    NOW(),
    'bea59fc5-812f-4b71-8228-a50ffc85c2e8',
    'bea59fc5-812f-4b71-8228-a50ffc85c2e8',
    NULL
);

-- 3. CREAR SEGUNDO RECLUTAMIENTO (MISMO PARTICIPANTE)
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
    '603b9cb7-fbf7-43db-844b-aef89b9921b5',
    'af4eb891-2a6e-44e0-84d3-b00592775c08',
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

-- 5. VER DETALLE DEL HISTORIAL
SELECT 
  'DETALLE HISTORIAL' as fuente,
  participante_interno_id,
  investigacion_id,
  reclutamiento_id,
  estado_sesion,
  created_at
FROM historial_participacion_participantes_internos
ORDER BY created_at DESC;

-- 6. SIMULAR API FINAL (DEBERÍA SER 2)
SELECT 
  'API PARTICIPANTE INTERNO FINAL' as fuente,
  COUNT(*) as total_participaciones
FROM historial_participacion_participantes_internos hpi
WHERE hpi.participante_interno_id = 'af4eb891-2a6e-44e0-84d3-b00592775c08'
  AND hpi.estado_sesion = 'pendiente'; 