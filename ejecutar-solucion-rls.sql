-- =============================================
-- SOLUCIÓN COMPLETA PARA EL PROBLEMA DE ACCESO
-- =============================================
-- Ejecuta este script en la consola SQL de Supabase

-- 1. DESHABILITAR RLS EN TODAS LAS TABLAS RELEVANTES
ALTER TABLE investigaciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE productos DISABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_investigacion DISABLE ROW LEVEL SECURITY;
ALTER TABLE periodo DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE roles_plataforma DISABLE ROW LEVEL SECURITY;
ALTER TABLE libretos_investigacion DISABLE ROW LEVEL SECURITY;

-- 2. VERIFICAR ESTADO DE RLS
SELECT 
    '🔍 VERIFICACIÓN RLS' as categoria,
    tablename,
    CASE 
        WHEN rowsecurity = false THEN '✅ DESHABILITADO (OK)'
        ELSE '❌ HABILITADO (PROBLEMA)'
    END as estado_rls
FROM pg_tables 
WHERE tablename IN (
    'investigaciones', 
    'productos', 
    'tipos_investigacion', 
    'periodo', 
    'profiles', 
    'user_roles',
    'roles_plataforma',
    'libretos_investigacion'
)
ORDER BY tablename;

-- 3. VERIFICAR QUE LAS TABLAS TENGAN DATOS
SELECT '📊 VERIFICACIÓN DE DATOS' as categoria;

SELECT 'productos' as tabla, COUNT(*) as cantidad FROM productos;
SELECT 'tipos_investigacion' as tabla, COUNT(*) as cantidad FROM tipos_investigacion;
SELECT 'periodo' as tabla, COUNT(*) as cantidad FROM periodo;
SELECT 'profiles' as tabla, COUNT(*) as cantidad FROM profiles;
SELECT 'user_roles' as tabla, COUNT(*) as cantidad FROM user_roles;
SELECT 'roles_plataforma' as tabla, COUNT(*) as cantidad FROM roles_plataforma;

-- 4. VERIFICAR USUARIOS CON ROLES
SELECT 
    '👥 USUARIOS CON ROLES' as categoria,
    p.full_name,
    p.email,
    ur.role,
    rp.nombre as rol_plataforma
FROM profiles p
LEFT JOIN user_roles ur ON p.id = ur.user_id
LEFT JOIN roles_plataforma rp ON ur.role = rp.id
ORDER BY p.full_name;

-- 5. MENSAJE FINAL
SELECT 
    '🎉 SOLUCIÓN APLICADA' as resultado,
    'RLS deshabilitado en todas las tablas' as accion,
    'Recarga tu aplicación y prueba crear una investigación' as siguiente_paso; 