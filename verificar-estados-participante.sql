-- Verificar estados de participante en la tabla estado_participante_cat
SELECT 
    id,
    nombre,
    activo,
    created_at
FROM estado_participante_cat 
ORDER BY nombre;

-- Verificar si hay participantes con estados que no existen en la tabla
SELECT 
    p.id,
    p.nombre,
    p.estado_participante,
    epc.nombre as estado_nombre
FROM participantes p
LEFT JOIN estado_participante_cat epc ON p.estado_participante = epc.id
WHERE p.estado_participante IS NOT NULL
ORDER BY p.nombre;

-- Contar participantes por estado
SELECT 
    COALESCE(epc.nombre, 'Sin estado') as estado,
    COUNT(*) as cantidad
FROM participantes p
LEFT JOIN estado_participante_cat epc ON p.estado_participante = epc.id
GROUP BY epc.nombre
ORDER BY cantidad DESC; 