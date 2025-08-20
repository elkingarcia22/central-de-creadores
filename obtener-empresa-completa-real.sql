-- =====================================================
-- CONSULTA PARA OBTENER UNA EMPRESA COMPLETA
-- =====================================================
-- Basado en las tablas reales encontradas en la base de datos

SELECT 
    e.id,
    e.nombre,
    e.descripcion,
    e.email,
    e.telefono,
    e.direccion,
    e.activo,
    e.creado_el,
    e.actualizado_el,
    
    -- Información de catálogos (nombres legibles)
    p.nombre as pais,
    i.nombre as industria,
    t.nombre as tamano,
    m.nombre as modalidad,
    r.nombre as relacion,
    est.nombre as estado,
    
    -- IDs de catálogos (para referencia)
    e.pais_id,
    e.industria_id,
    e.tamano_id,
    e.modalidad_id,
    e.relacion_id,
    e.estado_id,
    
    -- KAM asignado
    k.id as kam_id,
    k.nombre as kam_nombre,
    k.email as kam_email,
    
    -- Producto relacionado
    pr.id as producto_id,
    pr.nombre as producto_nombre,
    pr.activo as producto_activo,
    
    -- Unidad de negocio del producto
    un.id as unidad_negocio_id,
    un.nombre as unidad_negocio_nombre,
    
    -- Estadísticas de participantes
    COALESCE(participantes_stats.total_participantes, 0) as total_participantes,
    COALESCE(participantes_stats.participantes_activos, 0) as participantes_activos,
    COALESCE(participantes_stats.ultima_participacion, NULL) as ultima_participacion

FROM empresas e
LEFT JOIN paises p ON e.pais_id = p.id
LEFT JOIN industrias i ON e.industria_id = i.id
LEFT JOIN tamano_empresa t ON e.tamano_id = t.id
LEFT JOIN modalidades m ON e.modalidad_id = m.id
LEFT JOIN relaciones r ON e.relacion_id = r.id
LEFT JOIN estado_empresa est ON e.estado_id = est.id
LEFT JOIN kams k ON e.kam_id = k.id
LEFT JOIN productos pr ON e.producto_id = pr.id
LEFT JOIN unidades_negocio un ON pr.unidad_negocio_id = un.id
LEFT JOIN (
    SELECT 
        empresa_id,
        COUNT(*) as total_participantes,
        COUNT(CASE WHEN activo = true THEN 1 END) as participantes_activos,
        MAX(fecha_ultima_participacion) as ultima_participacion
    FROM participantes 
    WHERE empresa_id = $1
    GROUP BY empresa_id
) participantes_stats ON e.id = participantes_stats.empresa_id
WHERE e.id = $1;

-- =====================================================
-- CONSULTA ALTERNATIVA SIN PARÁMETROS (para testing)
-- =====================================================
-- Reemplaza 'UUID_DE_LA_EMPRESA' con un ID real

/*
SELECT 
    e.id,
    e.nombre,
    e.descripcion,
    e.email,
    e.telefono,
    e.direccion,
    e.activo,
    e.creado_el,
    e.actualizado_el,
    
    -- Información de catálogos (nombres legibles)
    p.nombre as pais,
    i.nombre as industria,
    t.nombre as tamano,
    m.nombre as modalidad,
    r.nombre as relacion,
    est.nombre as estado,
    
    -- IDs de catálogos (para referencia)
    e.pais_id,
    e.industria_id,
    e.tamano_id,
    e.modalidad_id,
    e.relacion_id,
    e.estado_id,
    
    -- KAM asignado
    k.id as kam_id,
    k.nombre as kam_nombre,
    k.email as kam_email,
    
    -- Producto relacionado
    pr.id as producto_id,
    pr.nombre as producto_nombre,
    pr.activo as producto_activo,
    
    -- Unidad de negocio del producto
    un.id as unidad_negocio_id,
    un.nombre as unidad_negocio_nombre,
    
    -- Estadísticas de participantes
    COALESCE(participantes_stats.total_participantes, 0) as total_participantes,
    COALESCE(participantes_stats.participantes_activos, 0) as participantes_activos,
    COALESCE(participantes_stats.ultima_participacion, NULL) as ultima_participacion

FROM empresas e
LEFT JOIN paises p ON e.pais_id = p.id
LEFT JOIN industrias i ON e.industria_id = i.id
LEFT JOIN tamano_empresa t ON e.tamano_id = t.id
LEFT JOIN modalidades m ON e.modalidad_id = m.id
LEFT JOIN relaciones r ON e.relacion_id = r.id
LEFT JOIN estado_empresa est ON e.estado_id = est.id
LEFT JOIN kams k ON e.kam_id = k.id
LEFT JOIN productos pr ON e.producto_id = pr.id
LEFT JOIN unidades_negocio un ON pr.unidad_negocio_id = un.id
LEFT JOIN (
    SELECT 
        empresa_id,
        COUNT(*) as total_participantes,
        COUNT(CASE WHEN activo = true THEN 1 END) as participantes_activos,
        MAX(fecha_ultima_participacion) as ultima_participacion
    FROM participantes 
    WHERE empresa_id = 'UUID_DE_LA_EMPRESA'
    GROUP BY empresa_id
) participantes_stats ON e.id = participantes_stats.empresa_id
WHERE e.id = 'UUID_DE_LA_EMPRESA';
*/
