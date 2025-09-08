-- Verificar si hay usuarios duplicados por ID
SELECT
    'USUARIOS_DUPLICADOS' AS tipo,
    u.id,
    COUNT(*) AS cantidad_duplicados,
    STRING_AGG(u.nombre, ', ') AS nombres,
    STRING_AGG(u.correo, ', ') AS correos
FROM
    public.usuarios u
GROUP BY
    u.id
HAVING
    COUNT(*) > 1
ORDER BY
    cantidad_duplicados DESC;
