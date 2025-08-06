-- ====================================
-- DIAGNÓSTICO DETALLADO DE CAMPOS VACÍOS
-- ====================================

-- 1. VERIFICAR DATOS EXACTOS EN TABLAS RELACIONADAS
SELECT '=== DATOS EN estado_empresa ===' as info;
SELECT id, nombre FROM estado_empresa ORDER BY nombre;

SELECT '=== DATOS EN relacion_empresa ===' as info;
SELECT id, nombre FROM relacion_empresa ORDER BY nombre;

-- 2. VERIFICAR EMPRESAS ANTES DE ACTUALIZAR
SELECT '=== EMPRESAS ANTES DE ACTUALIZAR ===' as info;
SELECT 
    id,
    nombre,
    estado,
    relacion,
    tamaño,
    modalidad
FROM empresas 
ORDER BY nombre;

-- 3. VERIFICAR SI LOS IDs EXISTEN
SELECT '=== VERIFICAR IDS DE estado_empresa ===' as info;
SELECT 
    'Activa' as nombre_buscado,
    (SELECT id FROM estado_empresa WHERE nombre = 'Activa' LIMIT 1) as id_encontrado,
    (SELECT COUNT(*) FROM estado_empresa WHERE nombre = 'Activa') as cantidad_encontrada;

SELECT '=== VERIFICAR IDS DE relacion_empresa ===' as info;
SELECT 
    'Cliente' as nombre_buscado,
    (SELECT id FROM relacion_empresa WHERE nombre = 'Cliente' LIMIT 1) as id_encontrado,
    (SELECT COUNT(*) FROM relacion_empresa WHERE nombre = 'Cliente') as cantidad_encontrada;

-- 4. INTENTAR ACTUALIZACIÓN MANUAL Y VER RESULTADO
SELECT '=== ACTUALIZACIÓN MANUAL ===' as info;

-- Actualizar solo una empresa para probar
UPDATE empresas 
SET estado = (SELECT id FROM estado_empresa WHERE nombre = 'Activa' LIMIT 1)
WHERE id = (SELECT id FROM empresas LIMIT 1)
AND estado IS NULL;

-- Verificar si se actualizó
SELECT '=== VERIFICAR SI SE ACTUALIZÓ ===' as info;
SELECT 
    id,
    nombre,
    estado,
    relacion
FROM empresas 
ORDER BY nombre;

-- 5. VERIFICAR SI HAY ERRORES EN LA ACTUALIZACIÓN
SELECT '=== VERIFICAR ERRORES ===' as info;

-- Verificar si hay empresas con estado NULL
SELECT 
    COUNT(*) as empresas_con_estado_null,
    COUNT(*) as empresas_con_relacion_null
FROM empresas 
WHERE estado IS NULL OR relacion IS NULL;

-- 6. MOSTRAR TODAS LAS EMPRESAS CON SUS RELACIONES
SELECT '=== EMPRESAS CON RELACIONES ===' as info;
SELECT 
    e.nombre,
    e.estado as estado_id,
    ee.nombre as estado_nombre,
    e.relacion as relacion_id,
    re.nombre as relacion_nombre,
    e.tamaño as tamaño_id,
    te.nombre as tamaño_nombre,
    e.modalidad as modalidad_id,
    m.nombre as modalidad_nombre
FROM empresas e
LEFT JOIN estado_empresa ee ON e.estado = ee.id
LEFT JOIN relacion_empresa re ON e.relacion = re.id
LEFT JOIN tamano_empresa te ON e.tamaño = te.id
LEFT JOIN modalidades m ON e.modalidad = m.id
ORDER BY e.nombre; 