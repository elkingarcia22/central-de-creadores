-- TABLAS CON COLUMNAS KAM
SELECT 
    'TABLAS CON KAM' as seccion,
    table_name,
    column_name
FROM information_schema.columns 
WHERE column_name LIKE '%kam%' 
    OR column_name LIKE '%KAM%'
ORDER BY table_name, column_name;
