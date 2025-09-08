-- Verificar el usuario actual y sus datos
SELECT
    'USUARIO_ACTUAL' AS tipo,
    u.id,
    u.nombre,
    u.correo,
    u.activo
FROM
    public.usuarios u
WHERE
    u.activo = true
LIMIT 10;
