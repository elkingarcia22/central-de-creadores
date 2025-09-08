-- Crear usuario temporal con un correo diferente para evitar conflicto
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
    'egarcia@ubits.co-temp',
    true,
    null,
    false
)
RETURNING *;
