-- Actualizar el usuario existente con el ID correcto de auth.users
-- Solo ejecutar si el usuario existe en usuarios pero con ID diferente

UPDATE public.usuarios 
SET 
    id = '064ec394-e7d5-4e35-b24f-436bc7ffc00d',
    nombre = COALESCE(nombre, 'egarcia@ubits.co'),
    activo = true,
    borrado_manual = false
WHERE 
    correo = 'egarcia@ubits.co'
    AND id != '064ec394-e7d5-4e35-b24f-436bc7ffc00d'
RETURNING *;
