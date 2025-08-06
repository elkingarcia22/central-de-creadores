-- Verificar investigaciones disponibles para crear reclutamientos manuales
SELECT 
    id,
    nombre,
    estado,
    libreto
FROM investigaciones 
WHERE estado != 'por_agendar'
ORDER BY creado_el DESC
LIMIT 5; 