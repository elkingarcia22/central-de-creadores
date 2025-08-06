-- Verificar estructura de la tabla estado_reclutamiento
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'estado_reclutamiento' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Ver algunos datos de ejemplo de estado_reclutamiento
SELECT * FROM estado_reclutamiento LIMIT 3;

-- Verificar si existe tabla estado_reclutamiento_cat
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'estado_reclutamiento_cat' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Ver datos de estado_reclutamiento_cat si existe
SELECT * FROM estado_reclutamiento_cat LIMIT 3; 