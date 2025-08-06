-- Verificar estructura de la tabla reclutamientos
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'reclutamientos' 
ORDER BY ordinal_position;

-- Verificar todas las columnas que contengan 'estado'
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'reclutamientos' 
AND column_name LIKE '%estado%'
ORDER BY column_name;
