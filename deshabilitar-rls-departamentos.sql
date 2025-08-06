-- ====================================
-- DESHABILITAR RLS DEPARTAMENTOS
-- ====================================
-- Ejecutar en Supabase SQL Editor

-- PASO 1: Verificar estado actual de RLS
SELECT '=== ESTADO ACTUAL RLS ===' as info;

SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_habilitado
FROM pg_tables 
WHERE tablename = 'departamentos';

-- PASO 2: Deshabilitar RLS en departamentos
SELECT '=== DESHABILITANDO RLS ===' as info;

ALTER TABLE departamentos DISABLE ROW LEVEL SECURITY;

SELECT '✅ RLS deshabilitado en departamentos' as resultado;

-- PASO 3: Verificar que se deshabilitó
SELECT '=== VERIFICACIÓN RLS ===' as info;

SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_habilitado
FROM pg_tables 
WHERE tablename = 'departamentos';

-- PASO 4: Probar consulta
SELECT '=== PRUEBA CONSULTA ===' as info;

SELECT COUNT(*) as total_departamentos
FROM departamentos 
WHERE activo = true;

SELECT '🎉 RLS DESHABILITADO - El API debería funcionar ahora' as resultado_final; 