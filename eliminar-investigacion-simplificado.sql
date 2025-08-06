-- Eliminar la investigación automática de forma simplificada
-- ID: 3b5b3e72-953d-4b54-9a93-42209c1d352d

-- Primero eliminar registros del log de actividades (si existen)
DELETE FROM log_actividades_investigacion 
WHERE investigacion_id = '3b5b3e72-953d-4b54-9a93-42209c1d352d';

-- Luego eliminar el reclutamiento asociado
DELETE FROM reclutamientos 
WHERE investigacion_id = '3b5b3e72-953d-4b54-9a93-42209c1d352d';

-- Finalmente eliminar la investigación
DELETE FROM investigaciones 
WHERE id = '3b5b3e72-953d-4b54-9a93-42209c1d352d'; 