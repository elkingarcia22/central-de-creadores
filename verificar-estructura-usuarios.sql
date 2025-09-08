-- Verificar la estructura completa de la tabla usuarios
SELECT
    'ESTRUCTURA_USUARIOS' AS tipo,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM
    information_schema.columns
WHERE
    table_name = 'usuarios'
    AND table_schema = 'public'
ORDER BY
    ordinal_position;
