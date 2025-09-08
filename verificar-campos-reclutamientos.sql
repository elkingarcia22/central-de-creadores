-- Verificar todos los campos de la tabla reclutamientos
SELECT
    'CAMPOS_RECLUTAMIENTOS' AS tipo,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM
    information_schema.columns
WHERE
    table_name = 'reclutamientos'
    AND table_schema = 'public'
ORDER BY
    ordinal_position;
