-- ====================================
-- VERIFICAR Y CORREGIR VISTA ACTUAL
-- ====================================

-- 1. Verificar la estructura actual de la vista
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'vista_reclutamientos_completa'
ORDER BY ordinal_position;

-- 2. Verificar datos actuales de la vista
SELECT 
    investigacion_id,
    titulo_investigacion,
    participantes_requeridos,
    participantes_actuales,
    progreso_reclutamiento,
    progreso_porcentaje
FROM vista_reclutamientos_completa
LIMIT 5;

-- 3. Verificar datos reales de reclutamientos
SELECT 
    r.investigacion_id,
    i.nombre as investigacion_nombre,
    COUNT(DISTINCT r.participantes_id) as participantes_reales,
    li.numero_participantes as requeridos
FROM reclutamientos r
JOIN investigaciones i ON r.investigacion_id = i.id
LEFT JOIN libretos_investigacion li ON i.id = li.investigacion_id
WHERE r.participantes_id IS NOT NULL
GROUP BY r.investigacion_id, i.nombre, li.numero_participantes
ORDER BY participantes_reales DESC;
