-- Crear un participante interno
INSERT INTO participantes_internos (
    id,
    nombre,
    apellidos,
    email,
    telefono,
    departamento,
    cargo,
    activo,
    creado_por
) VALUES (
    gen_random_uuid(),
    'Juan',
    'Pérez',
    'juan.perez@empresa.com',
    '+573001234567',
    'Investigación',
    'Participante',
    true,
    (SELECT id FROM usuarios LIMIT 1)
) RETURNING id;

-- Asignar el participante a la investigación
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
    '12c5ce70-d6e0-422d-919c-7cc9b4867a48',
    (SELECT id FROM participantes_internos WHERE email = 'juan.perez@empresa.com' ORDER BY created_at DESC LIMIT 1),
    NOW(),
    NOW() + INTERVAL '7 days',
    (SELECT id FROM usuarios LIMIT 1),
    (SELECT id FROM usuarios LIMIT 1),
    (SELECT id FROM estado_reclutamiento_cat WHERE nombre = 'Pendiente')
); 