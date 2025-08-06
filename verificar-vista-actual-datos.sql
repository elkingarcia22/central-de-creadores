-- Verificar datos actuales de la vista
SELECT 
    investigacion_nombre,
    progreso_reclutamiento,
    porcentaje_completitud,
    participantes_reclutados
FROM vista_reclutamientos_completa 
LIMIT 3; 