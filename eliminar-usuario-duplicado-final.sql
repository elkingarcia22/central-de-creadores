-- Eliminar el usuario duplicado (ahora que las referencias están actualizadas)
DELETE FROM public.usuarios 
WHERE 
    id = 'bea59fc5-812f-4b71-8228-a50ffc85c2e8'
    AND correo = 'egarcia@ubits.co'
RETURNING *;
