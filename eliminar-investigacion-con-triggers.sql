-- Eliminar la investigación que se creó automáticamente, deshabilitando triggers temporalmente
-- Esta es la investigación "Investigación derivada: fsdfefefe..." con ID: 3b5b3e72-953d-4b54-9a93-42209c1d352d

-- Deshabilitar temporalmente los triggers en investigaciones
ALTER TABLE investigaciones DISABLE TRIGGER ALL;

-- Primero eliminar el reclutamiento asociado
DELETE FROM reclutamientos 
WHERE investigacion_id = '3b5b3e72-953d-4b54-9a93-42209c1d352d';

-- Luego eliminar la investigación
DELETE FROM investigaciones 
WHERE id = '3b5b3e72-953d-4b54-9a93-42209c1d352d';

-- Rehabilitar los triggers
ALTER TABLE investigaciones ENABLE TRIGGER ALL; 