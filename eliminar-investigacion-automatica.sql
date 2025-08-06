-- Eliminar la investigación que se creó automáticamente al crear un reclutamiento manual
-- Esta es la investigación "Investigación derivada: fsdfefefe..." con ID: 3b5b3e72-953d-4b54-9a93-42209c1d352d

-- Primero eliminar el reclutamiento asociado
DELETE FROM reclutamientos 
WHERE investigacion_id = '3b5b3e72-953d-4b54-9a93-42209c1d352d';

-- Luego eliminar la investigación
DELETE FROM investigaciones 
WHERE id = '3b5b3e72-953d-4b54-9a93-42209c1d352d'; 