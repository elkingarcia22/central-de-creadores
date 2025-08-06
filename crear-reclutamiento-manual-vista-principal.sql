-- Crear un reclutamiento manual para la investigación que está en la vista principal
INSERT INTO reclutamientos (
    id,
    investigacion_id,
    estado_reclutamiento_id,
    tipo_reclutamiento,
    fecha_inicio_reclutamiento,
    fecha_fin_reclutamiento,
    numero_participantes_objetivo,
    numero_participantes_reclutados,
    presupuesto_asignado,
    notas_reclutamiento,
    creado_el,
    actualizado_el
) VALUES (
    gen_random_uuid(),
    '12c5ce70-d6e0-422d-919c-7cc9b4867a48',
    (SELECT id FROM estado_reclutamiento_cat WHERE nombre = 'Pendiente'),
    'manual',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '30 days',
    15,
    0,
    5000.00,
    'Reclutamiento manual de prueba para validar que no aparece en la vista principal',
    NOW(),
    NOW()
); 