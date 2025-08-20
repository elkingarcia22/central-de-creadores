-- =====================================================
-- VER EMPRESA COMPLETA CON COLUMNAS REALES
-- =====================================================

-- 1. DATOS BÁSICOS DE LA EMPRESA (solo columnas que existen)
-- =====================================================
SELECT 
    'DATOS BÁSICOS' as seccion,
    id,
    nombre,
    descripcion,
    pais,
    industria,
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
    p.nombre as pais_nombre
FROM empresas e
LEFT JOIN paises p ON e.pais = p.id
WHERE e.id = '56ae11ec-f6b4-4066-9414-e51adfbebee2';

-- 3. INFORMACIÓN DE LA INDUSTRIA
-- =====================================================
SELECT 
    'INDUSTRIA' as seccion,
    e.nombre as empresa_nombre,
    e.industria as industria_id,
    i.nombre as industria_nombre
FROM empresas e
LEFT JOIN industrias i ON e.industria = i.id
WHERE e.id = '56ae11ec-f6b4-4066-9414-e51adfbebee2';

-- 4. INFORMACIÓN DEL TAMAÑO
-- =====================================================
SELECT 
    'TAMAÑO' as seccion,
    e.nombre as empresa_nombre,
    e.tamaño as tamano_id,
    t.nombre as tamano_nombre
FROM empresas e
LEFT JOIN tamano_empresa t ON e.tamaño = t.id
WHERE e.id = '56ae11ec-f6b4-4066-9414-e51adfbebee2';

-- 5. INFORMACIÓN DE LA MODALIDAD
-- =====================================================
SELECT 
    'MODALIDAD' as seccion,
    e.nombre as empresa_nombre,
    e.modalidad as modalidad_id,
    m.nombre as modalidad_nombre
FROM empresas e
LEFT JOIN modalidades m ON e.modalidad = m.id
WHERE e.id = '56ae11ec-f6b4-4066-9414-e51adfbebee2';

-- 6. INFORMACIÓN DE LA RELACIÓN
-- =====================================================
SELECT 
    'RELACIÓN' as seccion,
    e.nombre as empresa_nombre,
    e.relacion as relacion_id,
    r.nombre as relacion_nombre
FROM empresas e
LEFT JOIN relaciones r ON e.relacion = r.id
WHERE e.id = '56ae11ec-f6b4-4066-9414-e51adfbebee2';

-- 7. INFORMACIÓN DEL ESTADO
-- =====================================================
SELECT 
    'ESTADO' as seccion,
    e.nombre as empresa_nombre,
    e.estado as estado_id,
    est.nombre as estado_nombre
FROM empresas e
LEFT JOIN estado_empresa est ON e.estado = est.id
WHERE e.id = '56ae11ec-f6b4-4066-9414-e51adfbebee2';

-- 8. TODOS LOS DATOS EN UNA SOLA CONSULTA
-- =====================================================
SELECT 
    e.id,
    e.nombre,
    e.descripcion,
    
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
    est.nombre as estado_nombre

FROM empresas e
LEFT JOIN paises p ON e.pais = p.id
LEFT JOIN industrias i ON e.industria = i.id
LEFT JOIN tamano_empresa t ON e.tamaño = t.id
LEFT JOIN modalidades m ON e.modalidad = m.id
LEFT JOIN relaciones r ON e.relacion = r.id
LEFT JOIN estado_empresa est ON e.estado = est.id
WHERE e.id = '56ae11ec-f6b4-4066-9414-e51adfbebee2';

-- 9. VERIFICAR SI EXISTEN LOS IDs EN LAS TABLAS
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
WHERE e.id = '56ae11ec-f6b4-4066-9414-e51adfbebee2';
