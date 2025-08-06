-- Cambiar el estado de la investigación automática en lugar de eliminarla
-- ID: 3b5b3e72-953d-4b54-9a93-42209c1d352d

-- Cambiar el estado a 'deprecado' para que no aparezca en la vista de reclutamientos
UPDATE investigaciones 
SET estado = 'deprecado'
WHERE id = '3b5b3e72-953d-4b54-9a93-42209c1d352d'; 