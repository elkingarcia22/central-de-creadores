-- Script para deshabilitar RLS en todas las tablas de catálogos
-- Esto solucionará el problema de acceso a todas las tablas de una vez

-- Verificar estado actual de todas las tablas
SELECT 'Estado actual de RLS en todas las tablas de catálogos:' as mensaje;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('modalidades', 'tipos_prueba_cat', 'plataformas_cat', 'roles_empresa', 'industrias', 'paises', 'tamano_empresa')
ORDER BY tablename;

-- Verificar que las tablas tienen datos
SELECT 'Verificando datos existentes:' as mensaje;
SELECT 'modalidades' as tabla, COUNT(*) as total FROM modalidades
UNION ALL
SELECT 'tipos_prueba_cat' as tabla, COUNT(*) as total FROM tipos_prueba_cat
UNION ALL
SELECT 'plataformas_cat' as tabla, COUNT(*) as total FROM plataformas_cat
UNION ALL
SELECT 'roles_empresa' as tabla, COUNT(*) as total FROM roles_empresa
UNION ALL
SELECT 'industrias' as tabla, COUNT(*) as total FROM industrias
UNION ALL
SELECT 'paises' as tabla, COUNT(*) as total FROM paises
UNION ALL
SELECT 'tamano_empresa' as tabla, COUNT(*) as total FROM tamano_empresa
ORDER BY tabla;

-- Deshabilitar RLS en todas las tablas de catálogos
ALTER TABLE modalidades DISABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_prueba_cat DISABLE ROW LEVEL SECURITY;
ALTER TABLE plataformas_cat DISABLE ROW LEVEL SECURITY;
ALTER TABLE roles_empresa DISABLE ROW LEVEL SECURITY;
ALTER TABLE industrias DISABLE ROW LEVEL SECURITY;
ALTER TABLE paises DISABLE ROW LEVEL SECURITY;
ALTER TABLE tamano_empresa DISABLE ROW LEVEL SECURITY;

-- Verificar que RLS se deshabilitó en todas las tablas
SELECT 'Estado de RLS después de deshabilitar:' as mensaje;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('modalidades', 'tipos_prueba_cat', 'plataformas_cat', 'roles_empresa', 'industrias', 'paises', 'tamano_empresa')
ORDER BY tablename;

-- Verificar acceso final a todas las tablas
SELECT 'Verificación final - acceso a todas las tablas:' as mensaje;
SELECT 'modalidades' as tabla, COUNT(*) as total FROM modalidades
UNION ALL
SELECT 'tipos_prueba_cat' as tabla, COUNT(*) as total FROM tipos_prueba_cat
UNION ALL
SELECT 'plataformas_cat' as tabla, COUNT(*) as total FROM plataformas_cat
UNION ALL
SELECT 'roles_empresa' as tabla, COUNT(*) as total FROM roles_empresa
UNION ALL
SELECT 'industrias' as tabla, COUNT(*) as total FROM industrias
UNION ALL
SELECT 'paises' as tabla, COUNT(*) as total FROM paises
UNION ALL
SELECT 'tamano_empresa' as tabla, COUNT(*) as total FROM tamano_empresa
ORDER BY tabla;

-- Mostrar datos de modalidades específicamente
SELECT 'Datos de modalidades disponibles:' as mensaje;
SELECT id, nombre, activo FROM modalidades ORDER BY nombre; 