-- Verificar que la investigación ahora aparece en la vista de reclutamiento
SELECT COUNT(*) as total_investigaciones_pendientes
FROM vista_reclutamientos;

-- Ver datos de la vista
SELECT id, nombre, estado_reclutamiento, progreso_reclutamiento
FROM vista_reclutamientos; 