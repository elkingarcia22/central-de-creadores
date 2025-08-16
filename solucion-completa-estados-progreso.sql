-- ====================================
-- SOLUCIÓN COMPLETA: ESTADOS POR PROGRESO
-- ====================================
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar estados disponibles
SELECT '=== ESTADOS DISPONIBLES ===' as info;
SELECT id, nombre, color FROM estado_reclutamiento_cat ORDER BY nombre;

-- 2. Crear estados faltantes si no existen
SELECT '=== CREAR ESTADOS FALTANTES ===' as info;

-- Crear estado "Pendiente" si no existe
INSERT INTO estado_reclutamiento_cat (id, nombre, color, orden)
SELECT 
    gen_random_uuid(),
    'Pendiente',
    '#F59E0B',
    1
WHERE NOT EXISTS (SELECT 1 FROM estado_reclutamiento_cat WHERE nombre = 'Pendiente');

-- Crear estado "En progreso" si no existe
INSERT INTO estado_reclutamiento_cat (id, nombre, color, orden)
SELECT 
    gen_random_uuid(),
    'En progreso',
    '#3B82F6',
    2
WHERE NOT EXISTS (SELECT 1 FROM estado_reclutamiento_cat WHERE nombre = 'En progreso');

-- Crear estado "Completado" si no existe
INSERT INTO estado_reclutamiento_cat (id, nombre, color, orden)
SELECT 
    gen_random_uuid(),
    'Completado',
    '#10B981',
    3
WHERE NOT EXISTS (SELECT 1 FROM estado_reclutamiento_cat WHERE nombre = 'Completado');

-- 3. Verificar estados después de la creación
SELECT '=== ESTADOS DESPUÉS DE LA CREACIÓN ===' as info;
SELECT id, nombre, color, orden FROM estado_reclutamiento_cat ORDER BY orden, nombre;

-- 4. Eliminar la vista actual
DROP VIEW IF EXISTS vista_reclutamientos_completa;

-- 5. Crear la nueva vista con estado calculado por progreso usando la tabla
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
        i.tipo_investigacion_id,
        i.descripcion,
        i.link_prueba,
        i.link_resultados,
        i.riesgo,
        i.estado_reclutamiento,
        i.tipo_sesion,
        i.tipo_prueba,
        i.plataforma,
        i.fecha_seguimiento,
        i.notas_seguimiento,
        i.creado_por,
        i.periodo_id
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
),
libretos_completos AS (
    -- Obtener datos completos de libretos
    SELECT 
        li.id,
        li.investigacion_id,
        li.nombre_sesion,
        li.descripcion_general,
        li.numero_participantes,
        li.numero_participantes_esperados,
        li.duracion_estimada,
        li.duracion_estimada_minutos,
        li.objetivos,
        li.problema_situacion,
        li.hipotesis,
        li.resultado_esperado,
        li.productos_requeridos,
        li.productos_recomendaciones,
        li.plataforma_id,
        li.tipo_prueba,
        li.tipo_prueba_id,
        li.rol_empresa_id,
        li.industria_id,
        li.pais,
        li.pais_id,
        li.usuarios_participantes,
        li.link_prototipo,
        li.creado_por,
        li.creado_el,
        li.actualizado_el,
        li.modalidad_id,
        li.tamano_empresa_id
    FROM libretos_investigacion li
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
    COALESCE(lc.nombre_sesion, 'Sin libreto asignado') AS titulo_libreto,
    COALESCE(lc.descripcion_general, 'Sin descripción') AS descripcion_libreto,
    COALESCE(lc.numero_participantes, lc.numero_participantes_esperados, 0) AS participantes_requeridos,
    
    -- Datos de responsables
    COALESCE(resp.full_name, 'Sin asignar') AS responsable_nombre,
    COALESCE(resp.email, 'sin@email.com') AS responsable_email,
    COALESCE(impl.full_name, 'Sin asignar') AS implementador_nombre,
    COALESCE(impl.email, 'sin@email.com') AS implementador_email,
    
    -- Progreso del reclutamiento
    CASE 
        WHEN COALESCE(lc.numero_participantes, lc.numero_participantes_esperados, 0) > 0 THEN 
            CONCAT(COALESCE(ppi.total_participantes, 0), '/', COALESCE(lc.numero_participantes, lc.numero_participantes_esperados, 0))
        ELSE 
            CONCAT(COALESCE(ppi.total_participantes, 0), '/0')
    END AS progreso_reclutamiento,
    
    -- Porcentaje de completitud
    CASE 
        WHEN COALESCE(lc.numero_participantes, lc.numero_participantes_esperados, 0) > 0 THEN 
            ROUND((COALESCE(ppi.total_participantes, 0)::decimal / COALESCE(lc.numero_participantes, lc.numero_participantes_esperados, 0)::decimal) * 100, 1)
        ELSE 0 
    END AS progreso_porcentaje,
    
    -- Determinar si está completo
    CASE 
        WHEN COALESCE(ppi.total_participantes, 0) >= COALESCE(lc.numero_participantes, lc.numero_participantes_esperados, 0) 
        AND COALESCE(lc.numero_participantes, lc.numero_participantes_esperados, 0) > 0 THEN true
        ELSE false 
    END AS reclutamiento_completo,
    
    -- Tipo de reclutamiento
    'automatico' AS tipo_reclutamiento,
    
    -- ESTADO CALCULADO POR PROGRESO USANDO LA TABLA estado_reclutamiento_cat
    CASE 
        WHEN COALESCE(ppi.total_participantes, 0) = 0 THEN 
            (SELECT id FROM estado_reclutamiento_cat WHERE nombre = 'Pendiente')
        WHEN COALESCE(ppi.total_participantes, 0) > 0 AND 
             COALESCE(ppi.total_participantes, 0) < COALESCE(lc.numero_participantes, lc.numero_participantes_esperados, 0) THEN 
            (SELECT id FROM estado_reclutamiento_cat WHERE nombre = 'En progreso')
        WHEN COALESCE(ppi.total_participantes, 0) >= COALESCE(lc.numero_participantes, lc.numero_participantes_esperados, 0) AND
             COALESCE(lc.numero_participantes, lc.numero_participantes_esperados, 0) > 0 THEN 
            (SELECT id FROM estado_reclutamiento_cat WHERE nombre = 'Completado')
        ELSE 
            (SELECT id FROM estado_reclutamiento_cat WHERE nombre = 'Pendiente')
    END AS estado_reclutamiento_id,
    
    CASE 
        WHEN COALESCE(ppi.total_participantes, 0) = 0 THEN 'Pendiente'
        WHEN COALESCE(ppi.total_participantes, 0) > 0 AND 
             COALESCE(ppi.total_participantes, 0) < COALESCE(lc.numero_participantes, lc.numero_participantes_esperados, 0) THEN 'En progreso'
        WHEN COALESCE(ppi.total_participantes, 0) >= COALESCE(lc.numero_participantes, lc.numero_participantes_esperados, 0) AND
             COALESCE(lc.numero_participantes, lc.numero_participantes_esperados, 0) > 0 THEN 'Completado'
        ELSE 'Pendiente'
    END AS estado_reclutamiento_nombre,
    
    CASE 
        WHEN COALESCE(ppi.total_participantes, 0) = 0 THEN 
            (SELECT color FROM estado_reclutamiento_cat WHERE nombre = 'Pendiente')
        WHEN COALESCE(ppi.total_participantes, 0) > 0 AND 
             COALESCE(ppi.total_participantes, 0) < COALESCE(lc.numero_participantes, lc.numero_participantes_esperados, 0) THEN 
            (SELECT color FROM estado_reclutamiento_cat WHERE nombre = 'En progreso')
        WHEN COALESCE(ppi.total_participantes, 0) >= COALESCE(lc.numero_participantes, lc.numero_participantes_esperados, 0) AND
             COALESCE(lc.numero_participantes, lc.numero_participantes_esperados, 0) > 0 THEN 
            (SELECT color FROM estado_reclutamiento_cat WHERE nombre = 'Completado')
        ELSE 
            (SELECT color FROM estado_reclutamiento_cat WHERE nombre = 'Pendiente')
    END AS estado_reclutamiento_color,
    
    -- Campos adicionales para compatibilidad
    COALESCE(ppi.total_participantes, 0) AS participantes_reclutados,
    COALESCE(lc.numero_participantes, lc.numero_participantes_esperados, 0) AS libreto_numero_participantes,
    iu.investigacion_nombre AS investigacion_nombre,
    iu.investigacion_fecha_inicio,
    iu.investigacion_fecha_fin,
    COALESCE(lc.nombre_sesion, 'Sin libreto asignado') AS libreto_titulo,
    COALESCE(lc.descripcion_general, 'Sin descripción') AS libreto_descripcion,
    COALESCE(resp.full_name, 'Sin asignar') AS responsable_correo,
    COALESCE(impl.full_name, 'Sin asignar') AS implementador_correo,
    
    -- Campos adicionales de la investigación para el frontend
    iu.descripcion AS investigacion_descripcion,
    iu.link_prueba AS investigacion_link_prueba,
    iu.link_resultados AS investigacion_link_resultados,
    iu.riesgo AS investigacion_riesgo,
    iu.estado_reclutamiento AS investigacion_estado_reclutamiento,
    iu.tipo_sesion AS investigacion_tipo_sesion,
    iu.tipo_prueba AS investigacion_tipo_prueba,
    iu.plataforma AS investigacion_plataforma,
    iu.fecha_seguimiento AS investigacion_fecha_seguimiento,
    iu.notas_seguimiento AS investigacion_notas_seguimiento,
    iu.creado_por AS investigacion_creado_por,
    iu.periodo_id AS investigacion_periodo_id,
    
    -- Campo para indicar si tiene libreto
    CASE WHEN lc.id IS NOT NULL THEN true ELSE false END AS tiene_libreto,
    
    -- Campo para indicar si tiene participantes
    CASE WHEN COALESCE(ppi.total_participantes, 0) > 0 THEN true ELSE false END AS tiene_participantes

FROM investigaciones_unicas iu
LEFT JOIN libretos_completos lc ON iu.libreto_id::uuid = lc.id
LEFT JOIN productos p ON iu.producto_id = p.id
LEFT JOIN tipos_investigacion t ON iu.tipo_investigacion_id = t.id
LEFT JOIN profiles resp ON iu.responsable_id = resp.id
LEFT JOIN profiles impl ON iu.implementador_id = impl.id
LEFT JOIN participantes_por_investigacion ppi ON iu.investigacion_id = ppi.investigacion_id
ORDER BY iu.creado_el DESC;

-- 6. Verificar que la vista se creó correctamente
SELECT '✅ Vista vista_reclutamientos_completa creada con estados por progreso' as status;

-- 7. Probar la vista
SELECT '=== PRUEBA DE LA VISTA CON ESTADOS POR PROGRESO ===' as info;

SELECT 
    reclutamiento_id,
    investigacion_id,
    titulo_investigacion,
    titulo_libreto,
    estado_reclutamiento_nombre,
    estado_reclutamiento_color,
    participantes_requeridos,
    participantes_reclutados,
    progreso_reclutamiento,
    progreso_porcentaje,
    responsable_nombre,
    tiene_libreto,
    tiene_participantes
FROM vista_reclutamientos_completa 
ORDER BY creado_en DESC
LIMIT 10;

-- 8. Verificar estados por progreso
SELECT '=== VERIFICAR ESTADOS POR PROGRESO ===' as info;

SELECT 
    estado_reclutamiento_nombre,
    estado_reclutamiento_color,
    COUNT(*) as cantidad,
    AVG(progreso_porcentaje) as promedio_progreso
FROM vista_reclutamientos_completa 
GROUP BY estado_reclutamiento_nombre, estado_reclutamiento_color
ORDER BY estado_reclutamiento_nombre;
