-- ====================================
-- DIAGNÓSTICO SIMPLE DE DUPLICADOS
-- ====================================

-- 1. Verificar duplicados en la vista actual
SELECT 
    'DUPLICADOS EN VISTA' as tipo,
    investigacion_id,
    titulo_investigacion,
    COUNT(*) as cantidad
FROM vista_reclutamientos_completa 
GROUP BY investigacion_id, titulo_investigacion
HAVING COUNT(*) > 1
ORDER BY cantidad DESC;

-- 2. Verificar todos los registros en la vista
SELECT 
    'TODOS LOS REGISTROS EN VISTA' as tipo,
    reclutamiento_id,
    investigacion_id,
    titulo_investigacion,
    titulo_libreto,
    participantes_actuales,
    participantes_requeridos
FROM vista_reclutamientos_completa 
ORDER BY titulo_investigacion;

-- 3. Verificar múltiples libretos por investigación
SELECT 
    'MÚLTIPLES LIBRETOS' as tipo,
    investigacion_id,
    COUNT(*) as cantidad_libretos
FROM libretos_investigacion
GROUP BY investigacion_id
HAVING COUNT(*) > 1
ORDER BY cantidad_libretos DESC;

-- 4. Verificar múltiples reclutamientos por investigación
SELECT 
    'MÚLTIPLES RECLUTAMIENTOS' as tipo,
    r.investigacion_id,
    i.nombre as investigacion_nombre,
    COUNT(r.id) as cantidad_reclutamientos
FROM reclutamientos r
JOIN investigaciones i ON r.investigacion_id = i.id
WHERE i.estado = 'por_agendar'
GROUP BY r.investigacion_id, i.nombre
HAVING COUNT(r.id) > 1
ORDER BY cantidad_reclutamientos DESC;

-- 5. Verificar relación investigaciones-libretos
SELECT 
    'RELACIÓN INVESTIGACIONES-LIBRETOS' as tipo,
    i.id as investigacion_id,
    i.nombre as investigacion_nombre,
    i.libreto as libreto_id_desde_investigacion,
    li.id as libreto_id_desde_libretos,
    li.investigacion_id as investigacion_id_desde_libretos
FROM investigaciones i
LEFT JOIN libretos_investigacion li ON i.libreto::uuid = li.id OR li.investigacion_id = i.id
WHERE i.estado = 'por_agendar'
ORDER BY i.nombre;
