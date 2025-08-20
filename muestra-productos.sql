-- MUESTRA DE PRODUCTOS DISPONIBLES
SELECT 
    'MUESTRA PRODUCTOS' as seccion,
    id,
    nombre,
    activo
FROM productos 
LIMIT 5;
