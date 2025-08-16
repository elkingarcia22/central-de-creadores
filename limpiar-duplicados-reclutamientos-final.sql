-- ====================================
-- LIMPIAR DUPLICADOS EN RECLUTAMIENTOS - VERSIÓN FINAL
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar duplicados antes de limpiar
SELECT 
    '=== DUPLICADOS ANTES DE LIMPIAR ===' as info;

SELECT 
    investigacion_id,
    participantes_id,
    participantes_internos_id,
    participantes_friend_family_id,
    tipo_participante,
    fecha_asignado,
    estado_agendamiento,
    COUNT(*) as cantidad_duplicados,
    STRING_AGG(id::text, ', ') as ids_reclutamientos
FROM reclutamientos
GROUP BY 
    investigacion_id,
    participantes_id,
    participantes_internos_id,
    participantes_friend_family_id,
    tipo_participante,
    fecha_asignado,
    estado_agendamiento
HAVING COUNT(*) > 1
ORDER BY cantidad_duplicados DESC;

-- 2. Crear tabla temporal con reclutamientos únicos
CREATE TEMP TABLE reclutamientos_unicos AS
SELECT DISTINCT ON (
    investigacion_id,
    participantes_id,
    participantes_internos_id,
    participantes_friend_family_id,
    tipo_participante,
    fecha_asignado,
    estado_agendamiento
)
    id,
    investigacion_id,
    participantes_id,
    participantes_internos_id,
    participantes_friend_family_id,
    tipo_participante,
    fecha_asignado,
    fecha_sesion,
    hora_sesion,
    duracion_sesion,
    reclutador_id,
    creado_por,
    estado_agendamiento,
    updated_at,
    responsable_agendamiento
FROM reclutamientos
ORDER BY 
    investigacion_id,
    participantes_id,
    participantes_internos_id,
    participantes_friend_family_id,
    tipo_participante,
    fecha_asignado,
    estado_agendamiento,
    updated_at DESC; -- Mantener el más reciente

-- 3. Verificar cuántos registros únicos tenemos
SELECT 
    '=== REGISTROS ÚNICOS A MANTENER ===' as info,
    COUNT(*) as total_reclutamientos_unicos
FROM reclutamientos_unicos;

-- 4. Eliminar duplicados manteniendo solo los únicos
DELETE FROM reclutamientos 
WHERE id NOT IN (
    SELECT id FROM reclutamientos_unicos
);

-- 5. Verificar que se limpiaron los duplicados
SELECT 
    '=== VERIFICAR QUE NO HAY DUPLICADOS DESPUÉS DE LIMPIAR ===' as info;

SELECT 
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
    investigacion_id,
    participantes_id,
    participantes_internos_id,
    participantes_friend_family_id,
    tipo_participante,
    fecha_asignado,
    estado_agendamiento
HAVING COUNT(*) > 1
ORDER BY cantidad_registros DESC;

-- 6. Mostrar total de reclutamientos después de limpiar
SELECT 
    '=== TOTAL DE RECLUTAMIENTOS DESPUÉS DE LIMPIAR ===' as info,
    COUNT(*) as total_reclutamientos
FROM reclutamientos;

-- 7. Verificar las investigaciones problemáticas específicas
SELECT 
    '=== VERIFICAR INVESTIGACIONES PROBLEMÁTICAS ===' as info;

SELECT 
    r.investigacion_id,
    i.nombre as investigacion_nombre,
    COUNT(r.id) as total_reclutamientos,
    STRING_AGG(r.id::text, ', ') as ids_reclutamientos
FROM reclutamientos r
JOIN investigaciones i ON r.investigacion_id = i.id
WHERE i.nombre IN ('prueba ivestigacion nueva', 'peueba 1', 'prueba reclutamiento')
GROUP BY r.investigacion_id, i.nombre
ORDER BY i.nombre;

-- 8. Mostrar estadísticas finales
SELECT 
    '=== ESTADÍSTICAS FINALES ===' as info;

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
    'Total reclutamientos (después de limpiar)' as metric,
    COUNT(*) as valor
FROM reclutamientos;

-- 9. Limpiar tabla temporal
DROP TABLE IF EXISTS reclutamientos_unicos;
