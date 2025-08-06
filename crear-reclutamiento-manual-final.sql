-- ====================================
-- CREAR RECLUTAMIENTO MANUAL FINAL
-- ====================================
-- Este script crea un reclutamiento manual que aparecerá en el tab de reclutamiento
-- de la investigación específica, NO en la vista principal

-- 1. Crear un participante en la tabla participantes (estructura correcta)
INSERT INTO participantes (
    id,
    nombre,
    rol_empresa_id,
    doleres_necesidades,
    descripción,
    kam_id,
    empresa_id,
    fecha_ultima_participacion,
    total_participaciones,
    created_at,
    updated_at,
    creado_por,
    productos_relacionados,
    estado_participante
) VALUES (
    gen_random_uuid(),
    'Participante Manual Test',
    '020ba112-9f57-4dc3-b70f-c9a774dbe81b', -- Usar el mismo rol_empresa_id que existe
    'Necesidades de prueba',
    'Participante creado para prueba de reclutamiento manual',
    NULL,
    NULL,
    NULL,
    0,
    NOW(),
    NOW(),
    NULL,
    NULL,
    gen_random_uuid()
) RETURNING id;

-- 2. Crear el reclutamiento (esto aparecerá en el tab de reclutamiento de la investigación)
INSERT INTO reclutamientos (
    id,
    investigacion_id,
    participantes_id,
    fecha_asignado,
    fecha_sesion,
    reclutador_id,
    creado_por,
    estado_agendamiento
) VALUES (
    gen_random_uuid(),
    '3b5b3e72-953d-4b54-9a93-42209c1d352d', -- ID de la investigación
    (SELECT id FROM participantes WHERE nombre = 'Participante Manual Test' ORDER BY created_at DESC LIMIT 1),
    NOW(),
    NOW() + INTERVAL '7 days',
    NULL, -- reclutador_id
    NULL, -- creado_por
    NULL -- estado_agendamiento (NULL como en los existentes)
);

-- 3. Verificar que se creó correctamente
SELECT 
    'Reclutamiento creado' as status,
    r.id as reclutamiento_id,
    r.investigacion_id,
    r.fecha_asignado,
    r.fecha_sesion,
    p.nombre as participante_nombre,
    p.descripción as participante_descripcion
FROM reclutamientos r
JOIN participantes p ON r.participantes_id = p.id
WHERE p.nombre = 'Participante Manual Test'
ORDER BY r.fecha_asignado DESC
LIMIT 1;

-- 4. Verificar que NO aparece en la vista principal (debe seguir mostrando solo el progreso)
SELECT 
    'Vista principal actualizada' as tipo,
    id,
    nombre,
    participantes_actuales,
    participantes_objetivo,
    progreso_reclutamiento,
    porcentaje_avance
FROM vista_reclutamientos; 