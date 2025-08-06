-- ====================================
-- CREAR RECLUTAMIENTO CORRECTO
-- ====================================
-- Este script crea un reclutamiento que aparecerá en el tab de reclutamiento
-- de la investigación específica, NO en la vista principal

-- 1. Crear un participante interno
INSERT INTO participantes_internos (
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
    estado,
    creado_el,
    actualizado_el
) VALUES (
    gen_random_uuid(),
    'Participante Interno Test',
    'interno@example.com',
    '+573001234567',
    28,
    'Femenino',
    'Medellín, Colombia',
    'Estudiante',
    'Menos de 1 millón',
    'Universitario',
    'Soltero',
    0,
    '3b5b3e72-953d-4b54-9a93-42209c1d352d', -- ID de la investigación
    'activo',
    NOW(),
    NOW()
) RETURNING id;

-- 2. Crear el reclutamiento (esto aparecerá en el tab de reclutamiento de la investigación)
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
    (SELECT id FROM participantes_internos WHERE email = 'interno@example.com' ORDER BY creado_el DESC LIMIT 1),
    'manual',
    'en_progreso',
    NOW(),
    NOW() + INTERVAL '30 days',
    300000,
    'Reclutamiento interno creado para prueba',
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
    pi.nombre as participante_nombre,
    pi.email as participante_email
FROM reclutamientos r
JOIN participantes_internos pi ON r.participantes_id = pi.id
WHERE pi.email = 'interno@example.com'
ORDER BY r.creado_el DESC
LIMIT 1;

-- 4. Verificar que NO aparece en la vista principal
SELECT 
    'Reclutamiento en vista principal' as tipo,
    COUNT(*) as total
FROM vista_reclutamientos 
WHERE investigacion_id = '3b5b3e72-953d-4b54-9a93-42209c1d352d'
AND tipo_reclutamiento = 'manual'; 