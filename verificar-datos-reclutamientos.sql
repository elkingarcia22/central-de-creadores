-- Verificar datos en la tabla reclutamientos
SELECT COUNT(*) as total_reclutamientos FROM reclutamientos;

-- Ver algunos registros de ejemplo
SELECT * FROM reclutamientos LIMIT 5;

-- Verificar si hay reclutamientos asociados a investigaciones
SELECT 
    r.id,
    r.investigacion_id,
    i.nombre as investigacion_nombre,
    i.estado as investigacion_estado,
    r.fecha_asignado,
    r.fecha_sesion,
    r.estado_agendamiento
FROM reclutamientos r
LEFT JOIN investigaciones i ON r.investigacion_id = i.id
LIMIT 10; 