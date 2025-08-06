-- ====================================
-- HABILITAR RLS EN EMPRESAS CON POLÍTICAS SEGURAS
-- ====================================

-- 1. VERIFICAR ESTADO ACTUAL
SELECT '=== ESTADO ACTUAL ===' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_activo
FROM pg_tables 
WHERE tablename = 'empresas';

-- 2. HABILITAR RLS
SELECT '=== HABILITANDO RLS ===' as info;
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;

-- 3. CREAR POLÍTICA PARA LECTURA PÚBLICA
SELECT '=== CREANDO POLÍTICA DE LECTURA ===' as info;
DROP POLICY IF EXISTS "Permitir lectura pública de empresas" ON empresas;

CREATE POLICY "Permitir lectura pública de empresas" ON empresas
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- 4. VERIFICAR POLÍTICAS CREADAS
SELECT '=== POLÍTICAS CREADAS ===' as info;
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'empresas';

-- 5. VERIFICAR QUE RLS ESTÁ ACTIVO
SELECT '=== VERIFICAR RLS ACTIVO ===' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_activo
FROM pg_tables 
WHERE tablename = 'empresas';

-- 6. VERIFICAR QUE SE PUEDEN LEER LOS DATOS
SELECT '=== VERIFICAR LECTURA CON RLS ===' as info;
SELECT COUNT(*) as total_empresas FROM empresas;

SELECT '=== EMPRESAS DISPONIBLES ===' as info;
SELECT id, nombre FROM empresas ORDER BY nombre;

-- 7. MENSAJE FINAL
SELECT '✅ RLS habilitado con políticas seguras' as resultado; 