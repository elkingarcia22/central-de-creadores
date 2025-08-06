-- Verificar todos los registros relacionados con la investigación automática
-- ID: 3b5b3e72-953d-4b54-9a93-42209c1d352d

-- Verificar reclutamientos
SELECT 'reclutamientos' as tabla, COUNT(*) as cantidad
FROM reclutamientos 
WHERE investigacion_id = '3b5b3e72-953d-4b54-9a93-42209c1d352d';

-- Verificar log de actividades
SELECT 'log_actividades_investigacion' as tabla, COUNT(*) as cantidad
FROM log_actividades_investigacion 
WHERE investigacion_id = '3b5b3e72-953d-4b54-9a93-42209c1d352d';

-- Verificar seguimientos de investigación
SELECT 'seguimientos_investigacion' as tabla, COUNT(*) as cantidad
FROM seguimientos_investigacion 
WHERE investigacion_id = '3b5b3e72-953d-4b54-9a93-42209c1d352d';

-- Verificar participantes internos
SELECT 'participantes_internos' as tabla, COUNT(*) as cantidad
FROM participantes_internos 
WHERE investigacion_id = '3b5b3e72-953d-4b54-9a93-42209c1d352d'; 