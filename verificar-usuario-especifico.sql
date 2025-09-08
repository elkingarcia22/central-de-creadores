-- Verificar un usuario específico (reemplaza 'USER_ID_AQUI' con el ID real)
SELECT
    'USUARIO_ESPECIFICO' AS tipo,
    u.id,
    u.nombre,
    u.correo,
    u.activo,
    u.rol_plataforma,
    u.borrado_manual
FROM
    public.usuarios u
WHERE
    u.id = 'USER_ID_AQUI'  -- Reemplaza con el ID real del usuario
ORDER BY
    u.id;