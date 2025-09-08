-- Sincronizar usuario desde auth.users a usuarios
-- Solo ejecutar si el usuario existe en auth.users pero no en usuarios

INSERT INTO public.usuarios (
    id,
    nombre,
    correo,
    activo,
    rol_plataforma,
    borrado_manual
)
SELECT
    au.id,
    COALESCE(au.raw_user_meta_data->>'nombre', au.email) as nombre,
    au.email as correo,
    true as activo,
    null as rol_plataforma,
    false as borrado_manual
FROM
    auth.users au
WHERE
    au.id = '064ec394-e7d5-4e35-b24f-436bc7ffc00d'
    AND NOT EXISTS (
        SELECT 1 FROM public.usuarios u WHERE u.id = au.id
    )
RETURNING *;
