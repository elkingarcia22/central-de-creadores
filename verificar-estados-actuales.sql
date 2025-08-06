-- Verificar estados actuales en estado_participante_cat
SELECT 
    id,
    nombre,
    activo
FROM estado_participante_cat 
ORDER BY nombre;

-- Verificar si existen los estados de enfriamiento
SELECT 
    id,
    nombre,
    activo
FROM estado_participante_cat 
WHERE nombre IN ('Disponible', 'Enfriamiento')
ORDER BY nombre; 