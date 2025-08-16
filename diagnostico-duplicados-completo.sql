-- ====================================
-- DIAGNÓSTICO COMPLETO DE DUPLICADOS EN RECLUTAMIENTO
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- 1. VERIFICAR LA VISTA ACTUAL
SELECT 
    '=== VERIFICAR VISTA ACTUAL ===' as info;

SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views 
WHERE viewname = 'vista_reclutamientos_completa';

-- 2. VERIFICAR DATOS EN LA VISTA ACTUAL
SELECT 
    '=== DATOS EN VISTA ACTUAL ===' as info;

SELECT 
    reclutamiento_id,
    investigacion_id,
    titulo_investigacion,
    titulo_libreto,
    estado_reclutamiento,
    participantes_actuales,
    participantes_requeridos,
    progreso_reclutamiento,
    progreso_porcentaje,
    responsable_nombre,
    tiene_libreto,
    tiene_participantes,
    COUNT(*) as cantidad_registros
FROM vista_reclutamientos_completa 
GROUP BY 
    reclutamiento_id,
    investigacion_id,
    titulo_investigacion,
    titulo_libreto,
    estado_reclutamiento,
    participantes_actuales,
    participantes_requeridos,
    progreso_reclutamiento,
    progreso_porcentaje,
    responsable_nombre,
    tiene_libreto,
    tiene_participantes
HAVING COUNT(*) > 1
ORDER BY cantidad_registros DESC;

-- 3. VERIFICAR INVESTIGACIONES DUPLICADAS
SELECT 
    '=== INVESTIGACIONES DUPLICADAS ===' as info;

SELECT 
    investigacion_id,
    titulo_investigacion,
    COUNT(*) as cantidad_registros,
    STRING_AGG(reclutamiento_id::text, ', ') as reclutamiento_ids
FROM vista_reclutamientos_completa 
GROUP BY investigacion_id, titulo_investigacion
HAVING COUNT(*) > 1
ORDER BY cantidad_registros DESC;

-- 4. VERIFICAR DATOS EN TABLA INVESTIGACIONES
SELECT 
    '=== DATOS EN TABLA INVESTIGACIONES ===' as info;

SELECT 
    id,
    nombre,
    estado,
    libreto,
    responsable_id,
    implementador_id,
    creado_el,
    actualizado_el,
    COUNT(*) as cantidad_registros
FROM investigaciones
WHERE estado = 'por_agendar'
GROUP BY 
    id,
    nombre,
    estado,
    libreto,
    responsable_id,
    implementador_id,
    creado_el,
    actualizado_el
HAVING COUNT(*) > 1
ORDER BY cantidad_registros DESC;

-- 5. VERIFICAR DATOS EN TABLA RECLUTAMIENTOS
SELECT 
    '=== DATOS EN TABLA RECLUTAMIENTOS ===' as info;

SELECT 
    id,
    investigacion_id,
    participantes_id,
    participantes_internos_id,
    participantes_friend_family_id,
    tipo_participante,
    fecha_asignado,
    estado_agendamiento,
    COUNT(*) as cantidad_registros
FROM reclutamientos
GROUP BY 
    id,
    investigacion_id,
    participantes_id,
    participantes_internos_id,
    participantes_friend_family_id,
    tipo_participante,
    fecha_asignado,
    estado_agendamiento
HAVING COUNT(*) > 1
ORDER BY cantidad_registros DESC;

-- 6. VERIFICAR RELACIÓN ENTRE INVESTIGACIONES Y LIBRETOS
SELECT 
    '=== RELACIÓN INVESTIGACIONES-LIBRETOS ===' as info;

SELECT 
    i.id as investigacion_id,
    i.nombre as investigacion_nombre,
    i.libreto as libreto_id_desde_investigacion,
    li.id as libreto_id_desde_libretos,
    li.investigacion_id as investigacion_id_desde_libretos,
    CASE 
        WHEN i.libreto = li.id::text THEN 'COINCIDENCIA'
        WHEN li.investigacion_id = i.id THEN 'COINCIDENCIA'
        ELSE 'SIN COINCIDENCIA'
    END as tipo_relacion
FROM investigaciones i
LEFT JOIN libretos_investigacion li ON i.libreto::uuid = li.id OR li.investigacion_id = i.id
WHERE i.estado = 'por_agendar'
ORDER BY i.nombre;

-- 7. VERIFICAR MÚLTIPLES LIBRETOS POR INVESTIGACIÓN
SELECT 
    '=== MÚLTIPLES LIBRETOS POR INVESTIGACIÓN ===' as info;

SELECT 
    investigacion_id,
    COUNT(*) as cantidad_libretos,
    STRING_AGG(id::text, ', ') as libreto_ids
FROM libretos_investigacion
GROUP BY investigacion_id
HAVING COUNT(*) > 1
ORDER BY cantidad_libretos DESC;

-- 8. VERIFICAR MÚLTIPLES RECLUTAMIENTOS POR INVESTIGACIÓN
SELECT 
    '=== MÚLTIPLES RECLUTAMIENTOS POR INVESTIGACIÓN ===' as info;

SELECT 
    r.investigacion_id,
    i.nombre as investigacion_nombre,
    COUNT(r.id) as cantidad_reclutamientos,
    STRING_AGG(r.id::text, ', ') as reclutamiento_ids
FROM reclutamientos r
JOIN investigaciones i ON r.investigacion_id = i.id
WHERE i.estado = 'por_agendar'
GROUP BY r.investigacion_id, i.nombre
HAVING COUNT(r.id) > 1
ORDER BY cantidad_reclutamientos DESC;

-- 9. VERIFICAR DATOS ESPECÍFICOS DE INVESTIGACIONES PROBLEMÁTICAS
SELECT 
    '=== DATOS ESPECÍFICOS DE INVESTIGACIONES PROBLEMÁTICAS ===' as info;

SELECT 
    'INVESTIGACIÓN' as tipo,
    id,
    nombre,
    estado,
    libreto,
    responsable_id,
    implementador_id,
    creado_el
FROM investigaciones
WHERE nombre IN ('prueba ivestigacion nueva', 'peueba 1', 'prueba reclutamiento')
ORDER BY nombre, creado_el;

SELECT 
    'LIBRETOS' as tipo,
    li.id,
    li.investigacion_id,
    li.nombre_sesion,
    li.creado_el
FROM libretos_investigacion li
JOIN investigaciones i ON li.investigacion_id = i.id
WHERE i.nombre IN ('prueba ivestigacion nueva', 'peueba 1', 'prueba reclutamiento')
ORDER BY i.nombre, li.creado_el;

SELECT 
    'RECLUTAMIENTOS' as tipo,
    r.id,
    r.investigacion_id,
    r.participantes_id,
    r.tipo_participante,
    r.estado_agendamiento,
    r.fecha_asignado
FROM reclutamientos r
JOIN investigaciones i ON r.investigacion_id = i.id
WHERE i.nombre IN ('prueba ivestigacion nueva', 'peueba 1', 'prueba reclutamiento')
ORDER BY i.nombre, r.fecha_asignado;

-- 10. VERIFICAR SI HAY PROBLEMAS EN LA VISTA SQL
SELECT 
    '=== ANÁLISIS DE LA VISTA SQL ===' as info;

-- Simular la lógica de la vista paso a paso
WITH investigaciones_unicas AS (
    SELECT DISTINCT
        i.id AS investigacion_id,
        i.nombre AS investigacion_nombre,
        i.estado AS estado_investigacion,
        i.libreto AS libreto_id,
        i.responsable_id,
        i.implementador_id
    FROM investigaciones i
    WHERE i.estado = 'por_agendar'
),
participantes_por_investigacion AS (
    SELECT 
        r.investigacion_id,
        COUNT(DISTINCT r.id) as total_participantes
    FROM reclutamientos r
    WHERE r.estado_agendamiento != 'd32b84d1-6209-41d9-8108-03588ca1f9b5'
    GROUP BY r.investigacion_id
)
SELECT 
    'SIMULACIÓN VISTA' as tipo,
    iu.investigacion_id,
    iu.investigacion_nombre,
    iu.libreto_id,
    COALESCE(ppi.total_participantes, 0) as participantes,
    COUNT(*) as cantidad_filas_generadas
FROM investigaciones_unicas iu
LEFT JOIN libretos_investigacion li ON iu.libreto_id::uuid = li.id
LEFT JOIN participantes_por_investigacion ppi ON iu.investigacion_id = ppi.investigacion_id
GROUP BY 
    iu.investigacion_id,
    iu.investigacion_nombre,
    iu.libreto_id,
    ppi.total_participantes
HAVING COUNT(*) > 1
ORDER BY cantidad_filas_generadas DESC;

-- 11. RESUMEN FINAL
SELECT 
    '=== RESUMEN FINAL ===' as info;

SELECT 
    'Total investigaciones por agendar' as metric,
    COUNT(*) as valor
FROM investigaciones
WHERE estado = 'por_agendar'

UNION ALL

SELECT 
    'Total libretos' as metric,
    COUNT(*) as valor
FROM libretos_investigacion

UNION ALL

SELECT 
    'Total reclutamientos' as metric,
    COUNT(*) as valor
FROM reclutamientos

UNION ALL

SELECT 
    'Registros en vista actual' as metric,
    COUNT(*) as valor
FROM vista_reclutamientos_completa

UNION ALL

SELECT 
    'Investigaciones duplicadas en vista' as metric,
    COUNT(*) as valor
FROM (
    SELECT investigacion_id
    FROM vista_reclutamientos_completa 
    GROUP BY investigacion_id
    HAVING COUNT(*) > 1
) duplicados;
