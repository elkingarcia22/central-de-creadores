-- Crear usuario con el ID correcto de auth.users
-- Solo ejecutar si el usuario no existe con el ID correcto

INSERT INTO public.usuarios (
    id,
    nombre,
    correo,
    activo,
    rol_plataforma,
    borrado_manual
)
VALUES (
    '064ec394-e7d5-4e35-b24f-436bc7ffc00d',
    'egarcia@ubits.co',
    'egarcia@ubits.co',
    true,
    null,
    false
)
ON CONFLICT (id) DO NOTHING
RETURNING *;
