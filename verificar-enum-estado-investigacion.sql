-- Verificar los valores válidos del enum estado_investigacion
SELECT unnest(enum_range(NULL::enum_estado_investigacion)) as valores_enum;

-- Ver todos los estados que existen en la tabla investigaciones
SELECT DISTINCT estado FROM investigaciones ORDER BY estado;

-- Ver cuántas investigaciones hay por cada estado
SELECT estado, COUNT(*) as total 
FROM investigaciones 
GROUP BY estado 
ORDER BY total DESC; 