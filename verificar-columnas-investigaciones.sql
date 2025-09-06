-- Verificar las columnas de la tabla investigaciones
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'investigaciones' 
ORDER BY ordinal_position;
