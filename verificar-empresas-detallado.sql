-- ====================================
-- VERIFICACIÓN DETALLADA DE EMPRESAS
-- ====================================

-- 1. VERIFICAR EXISTENCIA Y DATOS
SELECT '=== VERIFICACIÓN BÁSICA ===' as info;
SELECT 
    COUNT(*) as total_empresas,
    COUNT(nombre) as con_nombre,
    COUNT(pais) as con_pais,
    COUNT(industria) as con_industria,
    COUNT(kam_id) as con_kam
FROM empresas;

-- 2. VERIFICAR EMPRESAS ESPECÍFICAS
SELECT '=== EMPRESAS ESPECÍFICAS ===' as info;
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

-- 3. VERIFICAR SI HAY EMPRESAS CON NOMBRES ESPECÍFICOS
SELECT '=== BUSCAR EMPRESAS ESPECÍFICAS ===' as info;
SELECT 
    id,
    nombre
FROM empresas 
WHERE nombre IN (
    'TechCorp Solutions',
    'FinanceHub International', 
    'HealthTech Innovations',
    'EduTech Pro',
    'GreenEnergy Corp'
)
ORDER BY nombre;

-- 4. VERIFICAR PERMISOS DE LECTURA
SELECT '=== PERMISOS DE LECTURA ===' as info;
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'empresas' 
AND table_schema = 'public'
AND privilege_type = 'SELECT';

-- 5. VERIFICAR RLS Y POLÍTICAS
SELECT '=== RLS Y POLÍTICAS ===' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_activo
FROM pg_tables 
WHERE tablename = 'empresas';

SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'empresas';

-- 6. VERIFICAR CONEXIÓN CON CATÁLOGOS
SELECT '=== VERIFICAR CATÁLOGOS ===' as info;
SELECT 
    'paises' as tabla,
    COUNT(*) as total
FROM paises
UNION ALL
SELECT 
    'industrias' as tabla,
    COUNT(*) as total
FROM industrias
UNION ALL
SELECT 
    'usuarios' as tabla,
    COUNT(*) as total
FROM usuarios
UNION ALL
SELECT 
    'estado_empresa' as tabla,
    COUNT(*) as total
FROM estado_empresa
UNION ALL
SELECT 
    'relacion_empresa' as tabla,
    COUNT(*) as total
FROM relacion_empresa
UNION ALL
SELECT 
    'tamano_empresa' as tabla,
    COUNT(*) as total
FROM tamano_empresa
UNION ALL
SELECT 
    'modalidades' as tabla,
    COUNT(*) as total
FROM modalidades;

-- 7. MENSAJE FINAL
SELECT '✅ Verificación detallada completada' as resultado; 