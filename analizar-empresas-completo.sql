-- =====================================================
-- ANÁLISIS COMPLETO DE EMPRESAS Y SUS RELACIONES
-- =====================================================

-- 1. ESTRUCTURA DE LA TABLA EMPRESAS
-- =====================================================
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'empresas' 
ORDER BY ordinal_position;

-- 2. DATOS DE EMPRESAS CON TODAS SUS RELACIONES
-- =====================================================
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
    
    -- Relaciones con catálogos
    p.nombre as pais_nombre,
    p.id as pais_id,
    
    i.nombre as industria_nombre,
    i.id as industria_id,
    
    s.nombre as sector_nombre,
    s.id as sector_id,
    
    t.nombre as tamano_nombre,
    t.id as tamano_id,
    
    m.nombre as modalidad_nombre,
    m.id as modalidad_id,
    
    r.nombre as relacion_nombre,
    r.id as relacion_id,
    
    est.nombre as estado_nombre,
    est.id as estado_id,
    
    -- KAM asignado
    k.full_name as kam_nombre,
    k.email as kam_email,
    k.id as kam_id,
    
    -- Producto relacionado
    pr.nombre as producto_nombre,
    pr.id as producto_id,
    
    -- Unidad de negocio del producto
    un.nombre as unidad_negocio_nombre,
    un.id as unidad_negocio_id

FROM empresas e
LEFT JOIN pais p ON e.pais_id = p.id
LEFT JOIN industria i ON e.industria_id = i.id
LEFT JOIN sector s ON e.sector_id = s.id
LEFT JOIN tamaño t ON e.tamaño_id = t.id
LEFT JOIN modalidad m ON e.modalidad_id = m.id
LEFT JOIN relacion r ON e.relacion_id = r.id
LEFT JOIN estado est ON e.estado_id = est.id
LEFT JOIN profiles k ON e.kam_id = k.id
LEFT JOIN productos pr ON e.producto_id = pr.id
LEFT JOIN unidades_negocio un ON pr.unidad_negocio_id = un.id
ORDER BY e.nombre;

-- 3. VERIFICAR CATÁLOGOS EXISTENTES
-- =====================================================

-- Catálogo de países
SELECT 'PAISES' as catalogo, COUNT(*) as total FROM pais;

-- Catálogo de industrias
SELECT 'INDUSTRIAS' as catalogo, COUNT(*) as total FROM industria;

-- Catálogo de sectores
SELECT 'SECTORES' as catalogo, COUNT(*) as total FROM sector;

-- Catálogo de tamaños
SELECT 'TAMAÑOS' as catalogo, COUNT(*) as total FROM tamaño;

-- Catálogo de modalidades
SELECT 'MODALIDADES' as catalogo, COUNT(*) as total FROM modalidad;

-- Catálogo de relaciones
SELECT 'RELACIONES' as catalogo, COUNT(*) as total FROM relacion;

-- Catálogo de estados
SELECT 'ESTADOS' as catalogo, COUNT(*) as total FROM estado;

-- 4. MUESTRA DE DATOS DE CATÁLOGOS
-- =====================================================

-- Países
SELECT 'PAISES' as catalogo, id, nombre FROM pais LIMIT 5;

-- Industrias
SELECT 'INDUSTRIAS' as catalogo, id, nombre FROM industria LIMIT 5;

-- Sectores
SELECT 'SECTORES' as catalogo, id, nombre FROM sector LIMIT 5;

-- Tamaños
SELECT 'TAMAÑOS' as catalogo, id, nombre FROM tamaño LIMIT 5;

-- Modalidades
SELECT 'MODALIDADES' as catalogo, id, nombre FROM modalidad LIMIT 5;

-- Relaciones
SELECT 'RELACIONES' as catalogo, id, nombre FROM relacion LIMIT 5;

-- Estados
SELECT 'ESTADOS' as catalogo, id, nombre FROM estado LIMIT 5;

-- 5. VERIFICAR RELACIONES CON PARTICIPANTES
-- =====================================================
SELECT 
    'PARTICIPANTES EXTERNOS' as tipo,
    COUNT(*) as total,
    COUNT(empresa_id) as con_empresa,
    COUNT(*) - COUNT(empresa_id) as sin_empresa
FROM participantes
UNION ALL
SELECT 
    'PARTICIPANTES INTERNOS' as tipo,
    COUNT(*) as total,
    0 as con_empresa,
    COUNT(*) as sin_empresa
FROM participantes_internos
UNION ALL
SELECT 
    'PARTICIPANTES FRIEND_FAMILY' as tipo,
    COUNT(*) as total,
    0 as con_empresa,
    COUNT(*) as sin_empresa
FROM participantes_friend_family;

-- 6. EMPRESAS CON MÁS PARTICIPANTES
-- =====================================================
SELECT 
    e.nombre as empresa_nombre,
    e.id as empresa_id,
    COUNT(p.id) as total_participantes
FROM empresas e
LEFT JOIN participantes p ON e.id = p.empresa_id
GROUP BY e.id, e.nombre
HAVING COUNT(p.id) > 0
ORDER BY total_participantes DESC
LIMIT 10;

-- 7. VERIFICAR ESTRUCTURA DE TABLAS RELACIONADAS
-- =====================================================

-- Estructura de participantes
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'participantes' 
ORDER BY ordinal_position;

-- Estructura de participantes_internos
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'participantes_internos' 
ORDER BY ordinal_position;

-- Estructura de participantes_friend_family
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'participantes_friend_family' 
ORDER BY ordinal_position;

-- 8. RESUMEN EJECUTIVO
-- =====================================================
SELECT 
    'RESUMEN EJECUTIVO' as seccion,
    'Total empresas' as metric,
    COUNT(*) as valor
FROM empresas
UNION ALL
SELECT 
    'RESUMEN EJECUTIVO' as seccion,
    'Empresas activas' as metric,
    COUNT(*) as valor
FROM empresas WHERE activo = true
UNION ALL
SELECT 
    'RESUMEN EJECUTIVO' as seccion,
    'Empresas con KAM' as metric,
    COUNT(*) as valor
FROM empresas WHERE kam_id IS NOT NULL
UNION ALL
SELECT 
    'RESUMEN EJECUTIVO' as seccion,
    'Empresas con producto' as metric,
    COUNT(*) as valor
FROM empresas WHERE producto_id IS NOT NULL
UNION ALL
SELECT 
    'RESUMEN EJECUTIVO' as seccion,
    'Participantes externos' as metric,
    COUNT(*) as valor
FROM participantes
UNION ALL
SELECT 
    'RESUMEN EJECUTIVO' as seccion,
    'Participantes con empresa' as metric,
    COUNT(*) as valor
FROM participantes WHERE empresa_id IS NOT NULL;
