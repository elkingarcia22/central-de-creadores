-- ====================================
-- DESHABILITAR RLS EN TABLAS EXISTENTES
-- ====================================
-- Basado en la estructura real de las tablas

-- Deshabilitar RLS en todas las tablas de catálogos
ALTER TABLE roles_empresa DISABLE ROW LEVEL SECURITY;
ALTER TABLE industrias DISABLE ROW LEVEL SECURITY;
ALTER TABLE paises DISABLE ROW LEVEL SECURITY;
ALTER TABLE tamano_empresa DISABLE ROW LEVEL SECURITY;
ALTER TABLE plataformas_cat DISABLE ROW LEVEL SECURITY;
ALTER TABLE modalidades DISABLE ROW LEVEL SECURITY;

-- Verificar que RLS está deshabilitado
SELECT 
    tablename,
    CASE 
        WHEN rowsecurity = true THEN '❌ HABILITADO' 
        ELSE '✅ DESHABILITADO' 
    END as rls_estado
FROM pg_tables 
WHERE tablename IN (
    'roles_empresa', 
    'industrias', 
    'paises', 
    'tamano_empresa', 
    'plataformas_cat', 
    'modalidades'
)
ORDER BY tablename;

-- Verificar que ahora se pueden consultar las tablas
SELECT 'roles_empresa' as tabla, COUNT(*) as total FROM roles_empresa;
SELECT 'industrias' as tabla, COUNT(*) as total FROM industrias;
SELECT 'paises' as tabla, COUNT(*) as total FROM paises;
SELECT 'tamano_empresa' as tabla, COUNT(*) as total FROM tamano_empresa;

-- Mostrar algunos ejemplos de roles_empresa
SELECT 'Ejemplos de roles_empresa:' as info, id, nombre FROM roles_empresa LIMIT 5; 