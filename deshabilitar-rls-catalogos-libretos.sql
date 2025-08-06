-- ====================================
-- DESHABILITAR RLS EN TABLAS DE CATÁLOGOS LIBRETOS
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- Deshabilitar RLS en todas las tablas de catálogos
ALTER TABLE roles_empresa DISABLE ROW LEVEL SECURITY;
ALTER TABLE industrias DISABLE ROW LEVEL SECURITY;
ALTER TABLE paises DISABLE ROW LEVEL SECURITY;
ALTER TABLE tamano_empresa DISABLE ROW LEVEL SECURITY;
ALTER TABLE plataformas_cat DISABLE ROW LEVEL SECURITY;
ALTER TABLE modalidades DISABLE ROW LEVEL SECURITY;

-- Verificar que RLS está deshabilitado
SELECT 
    'Estado RLS después de deshabilitar:' as info,
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

-- Probar que ahora se pueden consultar las tablas
SELECT 'Prueba roles_empresa:' as info, COUNT(*) as total FROM roles_empresa;
SELECT 'Prueba industrias:' as info, COUNT(*) as total FROM industrias;
SELECT 'Prueba paises:' as info, COUNT(*) as total FROM paises;
SELECT 'Prueba tamano_empresa:' as info, COUNT(*) as total FROM tamano_empresa;
SELECT 'Prueba plataformas_cat:' as info, COUNT(*) as total FROM plataformas_cat;
SELECT 'Prueba modalidades:' as info, COUNT(*) as total FROM modalidades;

-- Mostrar algunos ejemplos de cada tabla
SELECT 'Ejemplos roles_empresa:' as info, STRING_AGG(nombre, ', ') as ejemplos 
FROM (SELECT nombre FROM roles_empresa LIMIT 5) t;

SELECT 'Ejemplos industrias:' as info, STRING_AGG(nombre, ', ') as ejemplos 
FROM (SELECT nombre FROM industrias LIMIT 5) t;

SELECT 'Ejemplos paises:' as info, STRING_AGG(nombre, ', ') as ejemplos 
FROM (SELECT nombre FROM paises LIMIT 5) t;

SELECT 'Ejemplos tamano_empresa:' as info, STRING_AGG(nombre, ', ') as ejemplos 
FROM (SELECT nombre FROM tamano_empresa LIMIT 5) t; 