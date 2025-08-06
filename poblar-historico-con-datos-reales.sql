-- Poblar tabla de historial de participantes internos con datos reales de reclutamientos

-- Primero, verificar qué reclutamientos tenemos con participantes internos
SELECT 'Reclutamientos con participantes internos:' as info;
SELECT 
    r.id as reclutamiento_id,
    r.participantes_internos_id,
    pi.nombre as participante_nombre,
    r.investigacion_id,
    i.nombre as investigacion_nombre,
    r.fecha_sesion,
    r.duracion_sesion,
    r.estado_agendamiento,
    ea.nombre as estado_nombre
FROM reclutamientos r
JOIN participantes_internos pi ON r.participantes_internos_id = pi.id
JOIN investigaciones i ON r.investigacion_id = i.id
JOIN estado_agendamiento_cat ea ON r.estado_agendamiento = ea.id
WHERE r.participantes_internos_id IS NOT NULL
ORDER BY r.fecha_sesion DESC;

-- Insertar datos reales en el historial basado en los reclutamientos existentes
INSERT INTO historial_participacion_participantes_internos (
    participante_interno_id,
    investigacion_id,
    fecha_participacion,
    estado_sesion,
    duracion_minutos,
    reclutador_id,
    observaciones
)
SELECT 
    r.participantes_internos_id,
    r.investigacion_id,
    r.fecha_sesion,
    CASE 
        WHEN ea.nombre = 'Finalizado' THEN 'completada'
        WHEN ea.nombre = 'Cancelado' THEN 'cancelada'
        WHEN ea.nombre = 'En progreso' THEN 'completada' -- Asumimos que en progreso = completada para estadísticas
        ELSE 'completada' -- Por defecto completada para otros estados
    END as estado_sesion,
    r.duracion_sesion,
    r.reclutador_id,
    CONCAT('Sesión de ', i.nombre, ' - Estado: ', ea.nombre) as observaciones
FROM reclutamientos r
JOIN participantes_internos pi ON r.participantes_internos_id = pi.id
JOIN investigaciones i ON r.investigacion_id = i.id
JOIN estado_agendamiento_cat ea ON r.estado_agendamiento = ea.id
WHERE r.participantes_internos_id IS NOT NULL
  AND r.fecha_sesion IS NOT NULL
  AND NOT EXISTS (
    -- Evitar duplicados
    SELECT 1 FROM historial_participacion_participantes_internos h 
    WHERE h.participante_interno_id = r.participantes_internos_id 
      AND h.investigacion_id = r.investigacion_id
      AND h.fecha_participacion = r.fecha_sesion
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

-- Mostrar estadísticas por participante interno
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

-- Verificar específicamente el participante que mencionas
SELECT 'Verificación específica del participante:' as info;
SELECT 
    pi.nombre as participante,
    pi.id as participante_id,
    COUNT(h.id) as total_en_historial,
    COUNT(CASE WHEN h.estado_sesion = 'completada' THEN 1 END) as completadas_en_historial
FROM participantes_internos pi
LEFT JOIN historial_participacion_participantes_internos h ON pi.id = h.participante_interno_id
WHERE pi.nombre LIKE '%prueba%'
GROUP BY pi.id, pi.nombre; 