-- Poblar tabla de historial de participación para participantes internos con datos de ejemplo

-- Primero, verificar que tenemos participantes internos disponibles
SELECT 'Participantes internos disponibles:' as info;
SELECT id, nombre, email, departamento FROM participantes_internos LIMIT 5;

-- Verificar investigaciones disponibles
SELECT 'Investigaciones disponibles:' as info;
SELECT id, nombre FROM investigaciones LIMIT 5;

-- Insertar datos de ejemplo en el historial
INSERT INTO historial_participacion_participantes_internos (
    participante_interno_id,
    investigacion_id,
    fecha_participacion,
    estado_sesion,
    duracion_minutos,
    reclutador_id,
    observaciones
) VALUES 
-- Participante interno 1 - Múltiples participaciones
(
    (SELECT id FROM participantes_internos WHERE nombre LIKE '%prueba%' LIMIT 1),
    (SELECT id FROM investigaciones WHERE nombre LIKE '%prueba%' LIMIT 1),
    '2025-07-25 10:00:00+00:00',
    'completada',
    60,
    (SELECT id FROM auth.users LIMIT 1),
    'Sesión de prueba de usabilidad completada exitosamente'
),
(
    (SELECT id FROM participantes_internos WHERE nombre LIKE '%prueba%' LIMIT 1),
    (SELECT id FROM investigaciones WHERE nombre LIKE '%prueba%' LIMIT 1),
    '2025-07-20 14:30:00+00:00',
    'completada',
    45,
    (SELECT id FROM auth.users LIMIT 1),
    'Entrevista de investigación cualitativa'
),
(
    (SELECT id FROM participantes_internos WHERE nombre LIKE '%prueba%' LIMIT 1),
    (SELECT id FROM investigaciones WHERE nombre LIKE '%prueba%' LIMIT 1),
    '2025-07-15 09:15:00+00:00',
    'cancelada',
    60,
    (SELECT id FROM auth.users LIMIT 1),
    'Sesión cancelada por emergencia del participante'
),
(
    (SELECT id FROM participantes_internos WHERE nombre LIKE '%prueba%' LIMIT 1),
    (SELECT id FROM investigaciones WHERE nombre LIKE '%prueba%' LIMIT 1),
    '2025-07-10 16:00:00+00:00',
    'completada',
    90,
    (SELECT id FROM auth.users LIMIT 1),
    'Sesión extendida de testing de funcionalidades'
),
-- Participante interno 2 - Menos participaciones
(
    (SELECT id FROM participantes_internos WHERE nombre NOT LIKE '%prueba%' LIMIT 1),
    (SELECT id FROM investigaciones WHERE nombre LIKE '%prueba%' LIMIT 1),
    '2025-07-22 11:00:00+00:00',
    'completada',
    60,
    (SELECT id FROM auth.users LIMIT 1),
    'Primera sesión de este participante'
),
(
    (SELECT id FROM participantes_internos WHERE nombre NOT LIKE '%prueba%' LIMIT 1),
    (SELECT id FROM investigaciones WHERE nombre LIKE '%prueba%' LIMIT 1),
    '2025-07-18 15:30:00+00:00',
    'reprogramada',
    60,
    (SELECT id FROM auth.users LIMIT 1),
    'Sesión reprogramada por conflicto de horario'
);

-- Verificar los datos insertados
SELECT 'Datos insertados en historial:' as info;
SELECT 
    h.id,
    pi.nombre as participante,
    i.nombre as investigacion,
    h.fecha_participacion,
    h.estado_sesion,
    h.duracion_minutos,
    h.observaciones
FROM historial_participacion_participantes_internos h
JOIN participantes_internos pi ON h.participante_interno_id = pi.id
JOIN investigaciones i ON h.investigacion_id = i.id
ORDER BY h.fecha_participacion DESC;

-- Mostrar estadísticas por participante
SELECT 'Estadísticas por participante interno:' as info;
SELECT 
    pi.nombre as participante,
    COUNT(*) as total_participaciones,
    COUNT(CASE WHEN h.estado_sesion = 'completada' THEN 1 END) as participaciones_completadas,
    COUNT(CASE WHEN h.estado_sesion = 'cancelada' THEN 1 END) as participaciones_canceladas,
    COUNT(CASE WHEN h.estado_sesion = 'reprogramada' THEN 1 END) as participaciones_reprogramadas,
    MAX(h.fecha_participacion) as ultima_participacion
FROM participantes_internos pi
LEFT JOIN historial_participacion_participantes_internos h ON pi.id = h.participante_interno_id
GROUP BY pi.id, pi.nombre
ORDER BY total_participaciones DESC; 