-- Verificar datos actuales de la vista usando columnas existentes
SELECT 
    investigacion_nombre,
    estado_investigacion,
    participantes_reclutados,
    progreso_reclutamiento,
    porcentaje_completitud,
    tipo_reclutamiento
FROM vista_reclutamientos_completa 
LIMIT 3; 