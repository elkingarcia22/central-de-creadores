-- Verificar la estructura de la tabla participantes_internos
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'participantes_internos' 
ORDER BY ordinal_position; 