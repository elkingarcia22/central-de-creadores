-- Actualizar el correo del usuario correcto
UPDATE public.usuarios 
SET 
    correo = 'egarcia@ubits.co'
WHERE 
    id = '064ec394-e7d5-4e35-b24f-436bc7ffc00d'
    AND correo = 'egarcia@ubits.co-temp'
RETURNING *;
