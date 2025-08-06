-- Verificar que la investigación restante sigue en estado por agendar
SELECT 
    id,
    nombre,
    estado,
    creado_el
FROM investigaciones 
WHERE estado = 'por_agendar'
ORDER BY creado_el DESC; 