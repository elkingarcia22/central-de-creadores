-- Verificar el estado de todas las investigaciones
SELECT 
    id,
    nombre,
    estado,
    creado_el
FROM investigaciones 
ORDER BY creado_el DESC; 