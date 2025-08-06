-- Verificar que el reclutamiento manual se creó correctamente
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

-- Verificar que el participante se creó
SELECT 
    'Participante creado' as status,
    id,
    nombre,
    descripción,
    created_at
FROM participantes 
WHERE nombre = 'Participante Manual Test'
ORDER BY created_at DESC
LIMIT 1; 