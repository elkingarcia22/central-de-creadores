-- Verificar que el usuario correcto existe
SELECT
    'USUARIO_CORRECTO' AS tipo,
    u.id,
    u.nombre,
    u.correo,
    u.activo,
    u.rol_plataforma,
    u.borrado_manual
FROM
    public.usuarios u
WHERE
    u.id = '064ec394-e7d5-4e35-b24f-436bc7ffc00d';
