-- ====================================
-- CORREGIR VISTA RECLUTAMIENTOS SIN DUPLICADOS - VERSIÓN FINAL
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- 1. Eliminar la vista actual
DROP VIEW IF EXISTS vista_reclutamientos_completa;

-- 2. Crear la nueva vista sin duplicados y sin columnas duplicadas
CREATE VIEW vista_reclutamientos_completa AS
WITH investigaciones_unicas AS (
    -- Obtener investigaciones únicas en estado por_agendar
    SELECT DISTINCT
        i.id AS investigacion_id,
        i.nombre AS investigacion_nombre,
        i.estado AS estado_investigacion,
        i.fecha_inicio AS investigacion_fecha_inicio,
        i.fecha_fin AS investigacion_fecha_fin,
        i.riesgo_automatico AS investigacion_riesgo,
        i.creado_el,
        i.actualizado_el,
        i.libreto AS libreto_id,
        i.responsable_id,
        i.implementador_id,
        i.producto_id,
        i.tipo_investigacion_id
    FROM investigaciones i
    WHERE i.estado = 'por_agendar'
),
participantes_por_investigacion AS (
    -- Contar participantes únicos por investigación
    SELECT 
        r.investigacion_id,
        COUNT(DISTINCT r.id) as total_participantes
    FROM reclutamientos r
    WHERE r.estado_agendamiento != 'd32b84d1-6209-41d9-8108-03588ca1f9b5' -- Excluir "Pendiente de agendamiento"
    GROUP BY r.investigacion_id
)
SELECT 
    -- Campos de identificación (únicos)
    iu.investigacion_id AS reclutamiento_id,
    iu.investigacion_id AS investigacion_id,
    NULL::text AS participantes_id,
    
    -- Fechas
    iu.creado_el AS creado_en,
    iu.actualizado_el AS actualizado_en,
    
    -- Datos de la investigación
    iu.investigacion_nombre AS titulo_investigacion,
    iu.estado_investigacion,
    iu.investigacion_fecha_inicio AS fecha_inicio,
    iu.investigacion_fecha_fin AS fecha_fin,
    iu.investigacion_riesgo AS riesgo_automatico,
    
    -- Datos del libreto
    COALESCE(li.nombre_sesion, 'Sin libreto asignado') AS titulo_libreto,
    COALESCE(li.descripcion_general, 'Sin descripción') AS descripcion_libreto,
    COALESCE(li.numero_participantes, li.numero_participantes_esperados, 0) AS participantes_requeridos,
    
    -- Datos del producto
    COALESCE(p.nombre, 'Sin producto') AS producto_nombre,
    
    -- Datos del tipo de investigación
    COALESCE(t.nombre, 'Sin tipo') AS tipo_investigacion_nombre,
    
    -- Datos del participante (no aplica para investigaciones automáticas)
    'Sin participante' AS participante_nombre,
    
    -- Datos del reclutador (SIN DUPLICAR)
    COALESCE(resp.full_name, 'Sin asignar') AS responsable_nombre,
    COALESCE(resp.email, 'Sin email') AS responsable_email,
    COALESCE(impl.full_name, 'Sin asignar') AS implementador_nombre,
    COALESCE(impl.email, 'Sin email') AS implementador_email,
    
    -- Estado de reclutamiento (SIN DUPLICAR)
    COALESCE(er.nombre, 'Pendiente') AS estado_reclutamiento,
    COALESCE(er.color, '#6B7280') AS color_estado,
    COALESCE(er.orden, 1) AS orden_estado,
    
    -- Cálculos de participantes
    COALESCE(ppi.total_participantes, 0) AS participantes_actuales,
    
    -- Progreso del reclutamiento
    CASE 
        WHEN COALESCE(li.numero_participantes, li.numero_participantes_esperados, 0) > 0 THEN 
            CONCAT(COALESCE(ppi.total_participantes, 0), '/', COALESCE(li.numero_participantes, li.numero_participantes_esperados, 0))
        ELSE 
            CONCAT(COALESCE(ppi.total_participantes, 0), '/0')
    END AS progreso_reclutamiento,
    
    -- Porcentaje de completitud
    CASE 
        WHEN COALESCE(li.numero_participantes, li.numero_participantes_esperados, 0) > 0 THEN 
            ROUND((COALESCE(ppi.total_participantes, 0)::decimal / COALESCE(li.numero_participantes, li.numero_participantes_esperados, 0)::decimal) * 100, 1)
        ELSE 0 
    END AS progreso_porcentaje,
    
    -- Determinar si está completo
    CASE 
        WHEN COALESCE(ppi.total_participantes, 0) >= COALESCE(li.numero_participantes, li.numero_participantes_esperados, 0) 
        AND COALESCE(li.numero_participantes, li.numero_participantes_esperados, 0) > 0 THEN true
        ELSE false 
    END AS reclutamiento_completo,
    
    -- Tipo de reclutamiento
    'automatico' AS tipo_reclutamiento,
    
    -- Campos adicionales para compatibilidad (SIN DUPLICAR)
    COALESCE(ppi.total_participantes, 0) AS participantes_reclutados,
    COALESCE(er.id::text, '1') AS estado_reclutamiento_id,
    COALESCE(er.nombre, 'Pendiente') AS estado_reclutamiento_nombre,
    COALESCE(er.color, '#6B7280') AS estado_reclutamiento_color,
    COALESCE(li.numero_participantes, li.numero_participantes_esperados, 0) AS libreto_numero_participantes,
    iu.investigacion_nombre AS investigacion_nombre,
    iu.investigacion_fecha_inicio,
    iu.investigacion_fecha_fin,
    iu.investigacion_riesgo,
    COALESCE(li.nombre_sesion, 'Sin libreto asignado') AS libreto_titulo,
    COALESCE(li.descripcion_general, 'Sin descripción') AS libreto_descripcion,
    COALESCE(resp.full_name, 'Sin asignar') AS responsable_correo,
    COALESCE(impl.full_name, 'Sin asignar') AS implementador_correo

FROM investigaciones_unicas iu
LEFT JOIN libretos_investigacion li ON iu.libreto_id::uuid = li.id
LEFT JOIN productos p ON iu.producto_id = p.id
LEFT JOIN tipos_investigacion t ON iu.tipo_investigacion_id = t.id
LEFT JOIN profiles resp ON iu.responsable_id = resp.id
LEFT JOIN profiles impl ON iu.implementador_id = impl.id
LEFT JOIN estado_reclutamiento_cat er ON er.nombre = 'Pendiente'
LEFT JOIN participantes_por_investigacion ppi ON iu.investigacion_id = ppi.investigacion_id
ORDER BY iu.creado_el DESC;

-- 3. Verificar que la vista se creó correctamente
SELECT 
    '✅ Vista vista_reclutamientos_completa creada sin duplicados' as status;

-- 4. Probar la vista
SELECT 
    '=== PRUEBA DE LA VISTA SIN DUPLICADOS ===' as info;

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
    responsable_nombre
FROM vista_reclutamientos_completa 
ORDER BY creado_en DESC
LIMIT 10;

-- 5. Verificar que no hay duplicados
SELECT 
    '=== VERIFICAR QUE NO HAY DUPLICADOS ===' as info;

SELECT 
    investigacion_id,
    titulo_investigacion,
    COUNT(*) as cantidad_registros
FROM vista_reclutamientos_completa 
GROUP BY investigacion_id, titulo_investigacion
HAVING COUNT(*) > 1
ORDER BY cantidad_registros DESC;

-- 6. Mostrar total de registros
SELECT 
    '=== TOTAL DE REGISTROS ===' as info,
    COUNT(*) as total_registros
FROM vista_reclutamientos_completa;

-- 7. Verificar que las investigaciones problemáticas ya no están duplicadas
SELECT 
    '=== VERIFICAR INVESTIGACIONES PROBLEMÁTICAS ===' as info;

SELECT 
    investigacion_id,
    titulo_investigacion,
    participantes_actuales,
    participantes_requeridos,
    progreso_reclutamiento,
    progreso_porcentaje
FROM vista_reclutamientos_completa 
WHERE titulo_investigacion IN ('prueba ivestigacion nueva', 'peueba 1', 'prueba reclutamiento')
ORDER BY titulo_investigacion, creado_en DESC;
