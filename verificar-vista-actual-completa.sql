-- Verificar datos completos de la vista actual
SELECT 
    investigacion_nombre,
    libreto_titulo,
    libreto_numero_participantes,
    progreso_reclutamiento,
    porcentaje_completitud,
    tipo_reclutamiento
FROM vista_reclutamientos_completa 
LIMIT 3; 