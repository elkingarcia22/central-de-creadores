-- Verificar usuario por correo en la tabla usuarios
SELECT
    'USUARIO_POR_CORREO' AS tipo,
    u.id,
    u.nombre,
    u.correo,
    u.activo,
    u.rol_plataforma,
    u.borrado_manual
FROM
    public.usuarios u
WHERE
    u.correo = 'egarcia@ubits.co';
