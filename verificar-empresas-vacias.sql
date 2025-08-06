-- ====================================
-- VERIFICAR SI EMPRESAS ESTÁN REALMENTE EN LA TABLA
-- ====================================

-- 1. VERIFICAR ESTADO ACTUAL
SELECT '=== ESTADO ACTUAL ===' as info;
SELECT COUNT(*) as total_empresas FROM empresas;

-- 2. VERIFICAR EMPRESAS ESPECÍFICAS
SELECT '=== BUSCAR EMPRESAS ESPECÍFICAS ===' as info;
SELECT 
    id,
    nombre,
    created_at,
    updated_at
FROM empresas 
WHERE nombre IN (
    'TechCorp Solutions',
    'FinanceHub International',
    'HealthTech Innovations',
    'EduTech Pro',
    'GreenEnergy Corp'
)
ORDER BY nombre;

-- 3. VERIFICAR TODAS LAS EMPRESAS
SELECT '=== TODAS LAS EMPRESAS ===' as info;
SELECT 
    id,
    nombre,
    pais,
    industria,
    kam_id,
    estado,
    relacion,
    tamaño,
    modalidad
FROM empresas 
ORDER BY nombre;

-- 4. VERIFICAR SI HAY ALGÚN REGISTRO
SELECT '=== VERIFICAR CUALQUIER REGISTRO ===' as info;
SELECT 
    'Total registros' as tipo,
    COUNT(*) as cantidad
FROM empresas
UNION ALL
SELECT 
    'Con nombre' as tipo,
    COUNT(nombre) as cantidad
FROM empresas
UNION ALL
SELECT 
    'Con ID' as tipo,
    COUNT(id) as cantidad
FROM empresas;

-- 5. VERIFICAR ESTRUCTURA DE LA TABLA
SELECT '=== ESTRUCTURA DE LA TABLA ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'empresas' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. INTENTAR INSERTAR UNA EMPRESA DE PRUEBA
SELECT '=== INSERTAR EMPRESA DE PRUEBA ===' as info;

-- Verificar si hay datos en catálogos
SELECT 'Catálogos disponibles:' as info;
SELECT 'paises' as tabla, COUNT(*) as total FROM paises
UNION ALL
SELECT 'industrias' as tabla, COUNT(*) as total FROM industrias
UNION ALL
SELECT 'usuarios' as tabla, COUNT(*) as total FROM usuarios
UNION ALL
SELECT 'estado_empresa' as tabla, COUNT(*) as total FROM estado_empresa
UNION ALL
SELECT 'relacion_empresa' as tabla, COUNT(*) as total FROM relacion_empresa
UNION ALL
SELECT 'tamano_empresa' as tabla, COUNT(*) as total FROM tamano_empresa
UNION ALL
SELECT 'modalidades' as tabla, COUNT(*) as total FROM modalidades;

-- Insertar empresa de prueba simple
INSERT INTO empresas (nombre, pais, industria, kam_id) 
SELECT 
    'Empresa de Prueba API',
    (SELECT id FROM paises LIMIT 1),
    (SELECT id FROM industrias LIMIT 1),
    (SELECT id FROM usuarios LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM empresas WHERE nombre = 'Empresa de Prueba API');

-- 7. VERIFICAR DESPUÉS DE INSERTAR
SELECT '=== DESPUÉS DE INSERTAR ===' as info;
SELECT COUNT(*) as total_empresas FROM empresas;

SELECT '=== EMPRESA INSERTADA ===' as info;
SELECT id, nombre FROM empresas WHERE nombre = 'Empresa de Prueba API';

-- 8. MENSAJE FINAL
SELECT '✅ Verificación completada' as resultado; 