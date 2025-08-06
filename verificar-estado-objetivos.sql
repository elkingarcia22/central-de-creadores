-- Verificar el estado actual de la investigación específica
SELECT 
    id,
    nombre,
    estado,
    creado_el
FROM investigaciones 
WHERE nombre = 'objetivos - Copia - Copia'; 