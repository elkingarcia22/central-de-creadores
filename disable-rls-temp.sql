-- Script para deshabilitar temporalmente RLS y eliminar políticas problemáticas
-- Ejecutar en el SQL Editor de Supabase

-- 1. Deshabilitar RLS en todas las tablas
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE roles_plataforma DISABLE ROW LEVEL SECURITY;

-- 2. Eliminar TODAS las políticas existentes (por si acaso)
DROP POLICY IF EXISTS "user_roles_select_policy" ON user_roles;
DROP POLICY IF EXISTS "user_roles_insert_policy" ON user_roles;
DROP POLICY IF EXISTS "user_roles_update_policy" ON user_roles;
DROP POLICY IF EXISTS "user_roles_delete_policy" ON user_roles;

DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;

DROP POLICY IF EXISTS "roles_plataforma_select_policy" ON roles_plataforma;
DROP POLICY IF EXISTS "roles_plataforma_insert_policy" ON roles_plataforma;
DROP POLICY IF EXISTS "roles_plataforma_update_policy" ON roles_plataforma;
DROP POLICY IF EXISTS "roles_plataforma_delete_policy" ON roles_plataforma;

-- 3. Verificar que RLS está deshabilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('profiles', 'user_roles', 'roles_plataforma')
ORDER BY tablename;

-- 4. Verificar que no hay políticas
SELECT 
    schemaname,
    tablename,
    policyname
FROM pg_policies 
WHERE tablename IN ('profiles', 'user_roles', 'roles_plataforma')
ORDER BY tablename, policyname; 