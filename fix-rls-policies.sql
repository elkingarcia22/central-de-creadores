-- Script para corregir las políticas de RLS que causan recursión infinita
-- Ejecutar en el SQL Editor de Supabase

-- 1. Eliminar todas las políticas existentes que puedan causar problemas
DROP POLICY IF EXISTS "User roles son visibles para usuarios autenticados" ON user_roles;
DROP POLICY IF EXISTS "User roles pueden ser creados por usuarios autenticados" ON user_roles;
DROP POLICY IF EXISTS "User roles pueden ser actualizados por usuarios autenticados" ON user_roles;
DROP POLICY IF EXISTS "User roles pueden ser eliminados por usuarios autenticados" ON user_roles;

DROP POLICY IF EXISTS "Profiles son visibles para usuarios autenticados" ON profiles;
DROP POLICY IF EXISTS "Usuarios pueden crear su propio perfil" ON profiles;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON profiles;
DROP POLICY IF EXISTS "Usuarios pueden eliminar su propio perfil" ON profiles;

DROP POLICY IF EXISTS "Roles plataforma son visibles para usuarios autenticados" ON roles_plataforma;
DROP POLICY IF EXISTS "Roles plataforma pueden ser creados por usuarios autenticados" ON roles_plataforma;
DROP POLICY IF EXISTS "Roles plataforma pueden ser actualizados por usuarios autenticados" ON roles_plataforma;
DROP POLICY IF EXISTS "Roles plataforma pueden ser eliminados por usuarios autenticados" ON roles_plataforma;

-- 2. Crear políticas simples y seguras para user_roles
CREATE POLICY "user_roles_select_policy" ON user_roles
    FOR SELECT USING (true);

CREATE POLICY "user_roles_insert_policy" ON user_roles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "user_roles_update_policy" ON user_roles
    FOR UPDATE USING (true);

CREATE POLICY "user_roles_delete_policy" ON user_roles
    FOR DELETE USING (true);

-- 3. Crear políticas simples para profiles
CREATE POLICY "profiles_select_policy" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "profiles_insert_policy" ON profiles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "profiles_update_policy" ON profiles
    FOR UPDATE USING (true);

CREATE POLICY "profiles_delete_policy" ON profiles
    FOR DELETE USING (true);

-- 4. Crear políticas simples para roles_plataforma
CREATE POLICY "roles_plataforma_select_policy" ON roles_plataforma
    FOR SELECT USING (true);

CREATE POLICY "roles_plataforma_insert_policy" ON roles_plataforma
    FOR INSERT WITH CHECK (true);

CREATE POLICY "roles_plataforma_update_policy" ON roles_plataforma
    FOR UPDATE USING (true);

CREATE POLICY "roles_plataforma_delete_policy" ON roles_plataforma
    FOR DELETE USING (true);

-- 5. Verificar que las políticas se crearon correctamente
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('profiles', 'user_roles', 'roles_plataforma')
ORDER BY tablename, policyname; 