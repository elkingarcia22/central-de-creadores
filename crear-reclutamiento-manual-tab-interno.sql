-- ====================================
-- CREAR RECLUTAMIENTO MANUAL EN TAB INTERNO
-- ====================================
-- Este script crea un reclutamiento manual que aparecerá en el tab interno
-- de la vista de reclutamiento de la investigación, NO en la vista principal

-- 1. Primero, crear un participante en la tabla participantes
INSERT INTO participantes (
    id,
    nombre,
    email,
    telefono,
    edad,
    genero,
    ubicacion,
    ocupacion,
    ingresos,
    educacion,
    estado_civil,
    hijos,
    investigacion_id,
    tipo_participante,
    estado,
    creado_el,
    actualizado_el
) VALUES (
    gen_random_uuid(),
    'Participante Manual Test',
    'test@example.com',
    '+573001234567',
    30,
    'Masculino',
    'Bogotá, Colombia',
    'Empleado',
    'Entre 2 y 4 millones',
    'Universitario',
    'Soltero',
    0,
    '3b5b3e72-953d-4b54-9a93-42209c1d352d', -- ID de la investigación
    'interno',
    'activo',
    NOW(),
    NOW()
) RETURNING id;

-- 2. Crear el reclutamiento manual (esto aparecerá en el tab interno)
INSERT INTO reclutamientos (
    id,
    investigacion_id,
    participantes_id,
    tipo_reclutamiento,
    estado,
    fecha_inicio,
    fecha_fin,
    presupuesto,
    notas,
    creado_el,
    actualizado_el
) VALUES (
    gen_random_uuid(),
    '3b5b3e72-953d-4b54-9a93-42209c1d352d', -- ID de la investigación
    (SELECT id FROM participantes WHERE email = 'test@example.com' ORDER BY creado_el DESC LIMIT 1),
    'manual',
    'en_progreso',
    NOW(),
    NOW() + INTERVAL '30 days',
    500000,
    'Reclutamiento manual creado para prueba',
    NOW(),
    NOW()
);

-- 3. Verificar que se creó correctamente
SELECT 
    'Reclutamiento creado' as status,
    r.id as reclutamiento_id,
    r.investigacion_id,
    r.tipo_reclutamiento,
    r.estado,
    p.nombre as participante_nombre,
    p.email as participante_email
FROM reclutamientos r
JOIN participantes p ON r.participantes_id = p.id
WHERE p.email = 'test@example.com'
ORDER BY r.creado_el DESC
LIMIT 1; 