-- Script para solucionar recursión infinita en user_roles
-- Ejecutar en el SQL Editor de Supabase

-- 1. Deshabilitar RLS temporalmente en user_roles
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- 2. Eliminar todas las políticas de user_roles
DROP POLICY IF EXISTS "user_roles_select_policy" ON user_roles;
DROP POLICY IF EXISTS "user_roles_insert_policy" ON user_roles;
DROP POLICY IF EXISTS "user_roles_update_policy" ON user_roles;
DROP POLICY IF EXISTS "user_roles_delete_policy" ON user_roles;

DROP POLICY IF EXISTS "user_roles_select_authenticated" ON user_roles;
DROP POLICY IF EXISTS "user_roles_insert_authenticated" ON user_roles;
DROP POLICY IF EXISTS "user_roles_update_authenticated" ON user_roles;
DROP POLICY IF EXISTS "user_roles_delete_authenticated" ON user_roles;

DROP POLICY IF EXISTS "User roles son visibles para usuarios autenticados" ON user_roles;
DROP POLICY IF EXISTS "User roles pueden ser creados por usuarios autenticados" ON user_roles;
DROP POLICY IF EXISTS "User roles pueden ser actualizados por usuarios autenticados" ON user_roles;
DROP POLICY IF EXISTS "User roles pueden ser eliminados por usuarios autenticados" ON user_roles;

-- 3. Verificar que user_roles no tiene políticas
SELECT 'Políticas en user_roles:' as info;
SELECT 
    schemaname,
    tablename,
    policyname
FROM pg_policies 
WHERE tablename = 'user_roles'
ORDER BY policyname;

-- 4. Verificar que RLS está deshabilitado en user_roles
SELECT 'Estado RLS en user_roles:' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'user_roles';

-- 5. Mantener RLS habilitado en las otras tablas pero con políticas simples
-- Asegurar que profiles tiene políticas simples
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;

CREATE POLICY "profiles_simple_select" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "profiles_simple_insert" ON profiles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "profiles_simple_update" ON profiles
    FOR UPDATE USING (true);

CREATE POLICY "profiles_simple_delete" ON profiles
    FOR DELETE USING (true);

-- Asegurar que roles_plataforma tiene políticas simples
DROP POLICY IF EXISTS "roles_plataforma_select_policy" ON roles_plataforma;
DROP POLICY IF EXISTS "roles_plataforma_insert_policy" ON roles_plataforma;
DROP POLICY IF EXISTS "roles_plataforma_update_policy" ON roles_plataforma;
DROP POLICY IF EXISTS "roles_plataforma_delete_policy" ON roles_plataforma;

CREATE POLICY "roles_plataforma_simple_select" ON roles_plataforma
    FOR SELECT USING (true);

CREATE POLICY "roles_plataforma_simple_insert" ON roles_plataforma
    FOR INSERT WITH CHECK (true);

CREATE POLICY "roles_plataforma_simple_update" ON roles_plataforma
    FOR UPDATE USING (true);

CREATE POLICY "roles_plataforma_simple_delete" ON roles_plataforma
    FOR DELETE USING (true);

-- 6. Verificar estado final
SELECT 'Estado final de todas las tablas:' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = t.tablename) as policy_count
FROM pg_tables t
WHERE tablename IN ('profiles', 'user_roles', 'roles_plataforma')
ORDER BY tablename; 