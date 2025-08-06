-- ====================================
-- VERIFICAR RECLUTAMIENTOS MANUALES
-- ====================================
-- Este script verifica que los reclutamientos manuales NO aparezcan en la vista principal
-- pero SÍ aparezcan en el tab interno de la investigación

-- 1. Verificar reclutamientos manuales en la tabla reclutamientos
SELECT 
    'Reclutamientos manuales en tabla' as tipo,
    COUNT(*) as total
FROM reclutamientos 
WHERE tipo_reclutamiento = 'manual';

-- 2. Verificar que NO aparezcan en la vista principal de reclutamiento
SELECT 
    'Reclutamientos manuales en vista principal' as tipo,
    COUNT(*) as total
FROM vista_reclutamientos 
WHERE tipo_reclutamiento = 'manual';

-- 3. Verificar que SÍ aparezcan en el tab interno de la investigación específica
SELECT 
    'Reclutamientos manuales para investigación específica' as tipo,
    r.id as reclutamiento_id,
    r.investigacion_id,
    r.tipo_reclutamiento,
    r.estado,
    p.nombre as participante_nombre,
    p.email as participante_email
FROM reclutamientos r
JOIN participantes p ON r.participantes_id = p.id
WHERE r.tipo_reclutamiento = 'manual'
AND r.investigacion_id = '3b5b3e72-953d-4b54-9a93-42209c1d352d';

-- 4. Verificar la vista principal (debe mostrar solo reclutamientos automáticos)
SELECT 
    'Vista principal - solo automáticos' as tipo,
    id,
    investigacion_id,
    tipo_reclutamiento,
    estado,
    progreso_participantes
FROM vista_reclutamientos; 