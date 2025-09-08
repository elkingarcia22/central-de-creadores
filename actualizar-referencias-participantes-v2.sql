-- Actualizar las referencias de participantes para que apunten al usuario correcto
UPDATE public.participantes 
SET 
    kam_id = '064ec394-e7d5-4e35-b24f-436bc7ffc00d'
WHERE 
    kam_id = 'bea59fc5-812f-4b71-8228-a50ffc85c2e8'
RETURNING *;
