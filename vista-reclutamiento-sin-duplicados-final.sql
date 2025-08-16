-- ====================================
-- VISTA RECLUTAMIENTO SIN DUPLICADOS - VERSIÓN FINAL
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- 1. Eliminar la vista actual
DROP VIEW IF EXISTS vista_reclutamientos_completa;

-- 2. Crear la nueva vista sin duplicados
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
libretos_unicos AS (
    -- Obtener un solo libreto por investigación (el más reciente)
    SELECT DISTINCT ON (investigacion_id)
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
    ORDER BY investigacion_id, creado_el DESC
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
    
    -- Datos del libreto (completos para el frontend)
    COALESCE(lu.nombre_sesion, 'Sin libreto asignado') AS titulo_libreto,
    COALESCE(lu.descripcion_general, 'Sin descripción') AS descripcion_libreto,
    COALESCE(lu.numero_participantes, lu.numero_participantes_esperados, 0) AS participantes_requeridos,
    lu.duracion_estimada AS libreto_duracion,
    lu.duracion_estimada_minutos AS libreto_duracion_minutos,
    lu.objetivos AS libreto_objetivos,
    lu.problema_situacion AS libreto_problema_situacion,
    lu.hipotesis AS libreto_hipotesis,
    lu.resultado_esperado AS libreto_resultado_esperado,
    lu.productos_requeridos AS libreto_productos_requeridos,
    lu.productos_recomendaciones AS libreto_productos_recomendaciones,
    lu.plataforma_id AS libreto_plataforma_id,
    lu.tipo_prueba AS libreto_tipo_prueba,
    lu.tipo_prueba_id AS libreto_tipo_prueba_id,
    lu.rol_empresa_id AS libreto_rol_empresa_id,
    lu.industria_id AS libreto_industria_id,
    lu.pais AS libreto_pais,
    lu.pais_id AS libreto_pais_id,
    lu.usuarios_participantes AS libreto_usuarios_participantes,
    lu.link_prototipo AS libreto_link_prototipo,
    lu.creado_por AS libreto_creado_por,
    lu.creado_el AS libreto_creado_el,
    lu.actualizado_el AS libreto_actualizado_el,
    lu.modalidad_id AS libreto_modalidad_id,
    lu.tamano_empresa_id AS libreto_tamano_empresa_id,
    
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
        WHEN COALESCE(lu.numero_participantes, lu.numero_participantes_esperados, 0) > 0 THEN 
            CONCAT(COALESCE(ppi.total_participantes, 0), '/', COALESCE(lu.numero_participantes, lu.numero_participantes_esperados, 0))
        ELSE 
            CONCAT(COALESCE(ppi.total_participantes, 0), '/0')
    END AS progreso_reclutamiento,
    
    -- Porcentaje de completitud
    CASE 
        WHEN COALESCE(lu.numero_participantes, lu.numero_participantes_esperados, 0) > 0 THEN 
            ROUND((COALESCE(ppi.total_participantes, 0)::decimal / COALESCE(lu.numero_participantes, lu.numero_participantes_esperados, 0)::decimal) * 100, 1)
        ELSE 0 
    END AS progreso_porcentaje,
    
    -- Determinar si está completo
    CASE 
        WHEN COALESCE(ppi.total_participantes, 0) >= COALESCE(lu.numero_participantes, lu.numero_participantes_esperados, 0) 
        AND COALESCE(lu.numero_participantes, lu.numero_participantes_esperados, 0) > 0 THEN true
        ELSE false 
    END AS reclutamiento_completo,
    
    -- Tipo de reclutamiento
    'automatico' AS tipo_reclutamiento,
    
    -- Campos adicionales para compatibilidad (SIN DUPLICAR)
    COALESCE(ppi.total_participantes, 0) AS participantes_reclutados,
    COALESCE(er.id::text, '1') AS estado_reclutamiento_id,
    COALESCE(er.nombre, 'Pendiente') AS estado_reclutamiento_nombre,
    COALESCE(er.color, '#6B7280') AS estado_reclutamiento_color,
    COALESCE(lu.numero_participantes, lu.numero_participantes_esperados, 0) AS libreto_numero_participantes,
    iu.investigacion_nombre AS investigacion_nombre,
    iu.investigacion_fecha_inicio,
    iu.investigacion_fecha_fin,
    COALESCE(lu.nombre_sesion, 'Sin libreto asignado') AS libreto_titulo,
    COALESCE(lu.descripcion_general, 'Sin descripción') AS libreto_descripcion,
    COALESCE(resp.full_name, 'Sin asignar') AS responsable_correo,
    COALESCE(impl.full_name, 'Sin asignar') AS implementador_correo,
    
    -- Campos adicionales de la investigación para el frontend (solo los que existen)
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
    
    -- Campo para indicar si tiene libreto (para mostrar el tab)
    CASE WHEN lu.id IS NOT NULL THEN true ELSE false END AS tiene_libreto,
    
    -- Campo para indicar si tiene participantes (para mostrar el tab)
    CASE WHEN COALESCE(ppi.total_participantes, 0) > 0 THEN true ELSE false END AS tiene_participantes

FROM investigaciones_unicas iu
LEFT JOIN libretos_unicos lu ON iu.libreto_id::uuid = lu.id OR lu.investigacion_id = iu.investigacion_id
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
    responsable_nombre,
    tiene_libreto,
    tiene_participantes
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
    progreso_porcentaje,
    tiene_libreto,
    tiene_participantes
FROM vista_reclutamientos_completa 
WHERE titulo_investigacion IN ('prueba ivestigacion nueva', 'peueba 1', 'prueba reclutamiento')
ORDER BY titulo_investigacion, creado_en DESC;
