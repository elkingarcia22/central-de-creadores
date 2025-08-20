-- ESTRUCTURA DE LA TABLA KAMS
SELECT 
    'ESTRUCTURA KAMS' as seccion,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'kams' 
ORDER BY ordinal_position;
