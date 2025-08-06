-- Verificar todos los estados de participante disponibles
SELECT 
    id,
    nombre,
    activo
FROM estado_participante_cat 
ORDER BY nombre;

-- Verificar específicamente los estados de enfriamiento
SELECT 
    id,
    nombre,
    activo
FROM estado_participante_cat 
WHERE nombre LIKE '%enfriamiento%' OR nombre LIKE '%disponible%'
ORDER BY nombre; 