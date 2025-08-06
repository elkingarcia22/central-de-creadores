-- Script para asignar estado de reclutamiento "Pendiente" a investigaciones con libreto
-- que no tienen estado de reclutamiento asignado

-- 1. Verificar investigaciones que tienen libreto pero no estado de reclutamiento
SELECT 
    i.id,
    i.nombre,
    i.estado as estado_investigacion,
    i.estado_reclutamiento,
    l.titulo as libreto_titulo
FROM investigaciones i
INNER JOIN libretos_investigacion l ON i.id = l.investigacion_id
WHERE i.estado_reclutamiento IS NULL OR i.estado_reclutamiento = '';

-- 2. Obtener el ID del estado "Pendiente"
SELECT id, nombre, color FROM estado_reclutamiento_cat WHERE nombre = 'Pendiente';

-- 3. Actualizar investigaciones con libreto para asignar estado "Pendiente"
UPDATE investigaciones 
SET estado_reclutamiento = (
    SELECT id FROM estado_reclutamiento_cat WHERE nombre = 'Pendiente'
)
WHERE id IN (
    SELECT DISTINCT i.id
    FROM investigaciones i
    INNER JOIN libretos_investigacion l ON i.id = l.investigacion_id
    WHERE i.estado_reclutamiento IS NULL OR i.estado_reclutamiento = ''
);

-- 4. Verificar el resultado
SELECT 
    i.id,
    i.nombre,
    i.estado as estado_investigacion,
    i.estado_reclutamiento,
    erc.nombre as estado_reclutamiento_nombre,
    l.titulo as libreto_titulo
FROM investigaciones i
INNER JOIN libretos_investigacion l ON i.id = l.investigacion_id
LEFT JOIN estado_reclutamiento_cat erc ON i.estado_reclutamiento = erc.id
ORDER BY i.creado_el DESC; 