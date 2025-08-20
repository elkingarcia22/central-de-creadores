-- ESTRUCTURA COMPLETA DE EMPRESAS
SELECT 
    'ESTRUCTURA EMPRESAS' as seccion,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'empresas' 
ORDER BY ordinal_position;
