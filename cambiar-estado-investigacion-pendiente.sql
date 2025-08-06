-- Cambiar el estado de una investigación a "Pendiente" para que aparezca en la vista de reclutamiento
UPDATE investigaciones 
SET estado_reclutamiento = '0d68ea67-ea95-4c0d-ae16-161b62c2b6b8' -- Pendiente
WHERE id = '3b5b3e72-953d-4b54-9a93-42209c1d352d' -- Usar una investigación existente
AND estado_reclutamiento IS NULL;

-- Verificar que el cambio se aplicó
SELECT id, nombre, estado_reclutamiento 
FROM investigaciones 
WHERE id = '3b5b3e72-953d-4b54-9a93-42209c1d352d'; 