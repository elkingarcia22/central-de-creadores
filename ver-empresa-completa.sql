-- =====================================================
-- VER EMPRESA COMPLETA CON TODA SU INFORMACIÓN
-- =====================================================

-- Reemplaza 'ID_DE_LA_EMPRESA' con el ID real de la empresa que quieres ver
-- Por ejemplo: '56ae11ec-f6b4-4066-9414-e51adfbebee2'

-- 1. DATOS BÁSICOS DE LA EMPRESA
-- =====================================================
SELECT 
    'DATOS BÁSICOS' as seccion,
    id,
    nombre,
    descripcion,
    email,
    telefono,
    direccion,
    activo,
    creado_el,
    actualizado_el,
    pais,
    industria,
    kam_id,
    producto_id,
    estado,
    relacion,
    tamaño,
    modalidad
FROM empresas 
WHERE id = '56ae11ec-f6b4-4066-9414-e51adfbebee2';

-- 2. INFORMACIÓN DEL PAÍS
-- =====================================================
SELECT 
    'PAÍS' as seccion,
    e.nombre as empresa_nombre,
    e.pais as pais_id,
    p.nombre as pais_nombre,
    p.id as pais_id_verificado
FROM empresas e
LEFT JOIN paises p ON e.pais = p.id
WHERE e.id = '56ae11ec-f6b4-4066-9414-e51adfbebee2';

-- 3. INFORMACIÓN DE LA INDUSTRIA
-- =====================================================
SELECT 
    'INDUSTRIA' as seccion,
    e.nombre as empresa_nombre,
    e.industria as industria_id,
    i.nombre as industria_nombre,
    i.id as industria_id_verificado
FROM empresas e
LEFT JOIN industrias i ON e.industria = i.id
WHERE e.id = '56ae11ec-f6b4-4066-9414-e51adfbebee2';

-- 4. INFORMACIÓN DEL TAMAÑO
-- =====================================================
SELECT 
    'TAMAÑO' as seccion,
    e.nombre as empresa_nombre,
    e.tamaño as tamano_id,
    t.nombre as tamano_nombre,
    t.id as tamano_id_verificado
FROM empresas e
LEFT JOIN tamano_empresa t ON e.tamaño = t.id
WHERE e.id = '56ae11ec-f6b4-4066-9414-e51adfbebee2';

-- 5. INFORMACIÓN DE LA MODALIDAD
-- =====================================================
SELECT 
    'MODALIDAD' as seccion,
    e.nombre as empresa_nombre,
    e.modalidad as modalidad_id,
    m.nombre as modalidad_nombre,
    m.id as modalidad_id_verificado
FROM empresas e
LEFT JOIN modalidades m ON e.modalidad = m.id
WHERE e.id = '56ae11ec-f6b4-4066-9414-e51adfbebee2';

-- 6. INFORMACIÓN DE LA RELACIÓN
-- =====================================================
SELECT 
    'RELACIÓN' as seccion,
    e.nombre as empresa_nombre,
    e.relacion as relacion_id,
    r.nombre as relacion_nombre,
    r.id as relacion_id_verificado
FROM empresas e
LEFT JOIN relaciones r ON e.relacion = r.id
WHERE e.id = '56ae11ec-f6b4-4066-9414-e51adfbebee2';

-- 7. INFORMACIÓN DEL ESTADO
-- =====================================================
SELECT 
    'ESTADO' as seccion,
    e.nombre as empresa_nombre,
    e.estado as estado_id,
    est.nombre as estado_nombre,
    est.id as estado_id_verificado
FROM empresas e
LEFT JOIN estado_empresa est ON e.estado = est.id
WHERE e.id = '56ae11ec-f6b4-4066-9414-e51adfbebee2';

-- 8. INFORMACIÓN DEL KAM
-- =====================================================
SELECT 
    'KAM' as seccion,
    e.nombre as empresa_nombre,
    e.kam_id,
    k.nombre as kam_nombre,
    k.email as kam_email,
    k.id as kam_id_verificado
FROM empresas e
LEFT JOIN kams k ON e.kam_id = k.id
WHERE e.id = '56ae11ec-f6b4-4066-9414-e51adfbebee2';

-- 9. INFORMACIÓN DEL PRODUCTO
-- =====================================================
SELECT 
    'PRODUCTO' as seccion,
    e.nombre as empresa_nombre,
    e.producto_id,
    p.nombre as producto_nombre,
    p.activo as producto_activo,
    p.id as producto_id_verificado,
    un.nombre as unidad_negocio_nombre
FROM empresas e
LEFT JOIN productos p ON e.producto_id = p.id
LEFT JOIN unidades_negocio un ON p.unidad_negocio_id = un.id
WHERE e.id = '56ae11ec-f6b4-4066-9414-e51adfbebee2';

-- 10. TODOS LOS DATOS EN UNA SOLA CONSULTA
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
    
    -- Información de catálogos
    e.pais as pais_id,
    p.nombre as pais_nombre,
    e.industria as industria_id,
    i.nombre as industria_nombre,
    e.tamaño as tamano_id,
    t.nombre as tamano_nombre,
    e.modalidad as modalidad_id,
    m.nombre as modalidad_nombre,
    e.relacion as relacion_id,
    r.nombre as relacion_nombre,
    e.estado as estado_id,
    est.nombre as estado_nombre,
    
    -- Información del KAM
    e.kam_id,
    k.nombre as kam_nombre,
    k.email as kam_email,
    
    -- Información del producto
    e.producto_id,
    pr.nombre as producto_nombre,
    pr.activo as producto_activo,
    un.nombre as unidad_negocio_nombre

FROM empresas e
LEFT JOIN paises p ON e.pais = p.id
LEFT JOIN industrias i ON e.industria = i.id
LEFT JOIN tamano_empresa t ON e.tamaño = t.id
LEFT JOIN modalidades m ON e.modalidad = m.id
LEFT JOIN relaciones r ON e.relacion = r.id
LEFT JOIN estado_empresa est ON e.estado = est.id
LEFT JOIN kams k ON e.kam_id = k.id
LEFT JOIN productos pr ON e.producto_id = pr.id
LEFT JOIN unidades_negocio un ON pr.unidad_negocio_id = un.id
WHERE e.id = '56ae11ec-f6b4-4066-9414-e51adfbebee2';

-- 11. VERIFICAR SI EXISTEN LOS IDs EN LAS TABLAS
-- =====================================================
SELECT 
    'VERIFICACIÓN DE EXISTENCIA' as seccion,
    'PAIS' as tabla,
    e.pais as id_buscado,
    CASE WHEN p.id IS NOT NULL THEN 'EXISTE' ELSE 'NO EXISTE' END as existe
FROM empresas e
LEFT JOIN paises p ON e.pais = p.id
WHERE e.id = '56ae11ec-f6b4-4066-9414-e51adfbebee2'

UNION ALL

SELECT 
    'VERIFICACIÓN DE EXISTENCIA' as seccion,
    'INDUSTRIA' as tabla,
    e.industria as id_buscado,
    CASE WHEN i.id IS NOT NULL THEN 'EXISTE' ELSE 'NO EXISTE' END as existe
FROM empresas e
LEFT JOIN industrias i ON e.industria = i.id
WHERE e.id = '56ae11ec-f6b4-4066-9414-e51adfbebee2'

UNION ALL

SELECT 
    'VERIFICACIÓN DE EXISTENCIA' as seccion,
    'TAMAÑO' as tabla,
    e.tamaño as id_buscado,
    CASE WHEN t.id IS NOT NULL THEN 'EXISTE' ELSE 'NO EXISTE' END as existe
FROM empresas e
LEFT JOIN tamano_empresa t ON e.tamaño = t.id
WHERE e.id = '56ae11ec-f6b4-4066-9414-e51adfbebee2'

UNION ALL

SELECT 
    'VERIFICACIÓN DE EXISTENCIA' as seccion,
    'MODALIDAD' as tabla,
    e.modalidad as id_buscado,
    CASE WHEN m.id IS NOT NULL THEN 'EXISTE' ELSE 'NO EXISTE' END as existe
FROM empresas e
LEFT JOIN modalidades m ON e.modalidad = m.id
WHERE e.id = '56ae11ec-f6b4-4066-9414-e51adfbebee2'

UNION ALL

SELECT 
    'VERIFICACIÓN DE EXISTENCIA' as seccion,
    'RELACIÓN' as tabla,
    e.relacion as id_buscado,
    CASE WHEN r.id IS NOT NULL THEN 'EXISTE' ELSE 'NO EXISTE' END as existe
FROM empresas e
LEFT JOIN relaciones r ON e.relacion = r.id
WHERE e.id = '56ae11ec-f6b4-4066-9414-e51adfbebee2'

UNION ALL

SELECT 
    'VERIFICACIÓN DE EXISTENCIA' as seccion,
    'ESTADO' as tabla,
    e.estado as id_buscado,
    CASE WHEN est.id IS NOT NULL THEN 'EXISTE' ELSE 'NO EXISTE' END as existe
FROM empresas e
LEFT JOIN estado_empresa est ON e.estado = est.id
WHERE e.id = '56ae11ec-f6b4-4066-9414-e51adfbebee2'

UNION ALL

SELECT 
    'VERIFICACIÓN DE EXISTENCIA' as seccion,
    'KAM' as tabla,
    e.kam_id as id_buscado,
    CASE WHEN k.id IS NOT NULL THEN 'EXISTE' ELSE 'NO EXISTE' END as existe
FROM empresas e
LEFT JOIN kams k ON e.kam_id = k.id
WHERE e.id = '56ae11ec-f6b4-4066-9414-e51adfbebee2'

UNION ALL

SELECT 
    'VERIFICACIÓN DE EXISTENCIA' as seccion,
    'PRODUCTO' as tabla,
    e.producto_id as id_buscado,
    CASE WHEN pr.id IS NOT NULL THEN 'EXISTE' ELSE 'NO EXISTE' END as existe
FROM empresas e
LEFT JOIN productos pr ON e.producto_id = pr.id
WHERE e.id = '56ae11ec-f6b4-4066-9414-e51adfbebee2';
