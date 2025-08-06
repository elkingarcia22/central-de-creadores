-- Ejecutar en el SQL Editor de Supabase

-- 1. Eliminar TODAS las políticas existentes
DROP POLICY IF EXISTS "profiles_select_authenticated" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_authenticated" ON profiles;
DROP POLICY IF EXISTS "profiles_update_owner" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_owner" ON profiles;

DROP POLICY IF EXISTS "user_roles_select_authenticated" ON user_roles;
DROP POLICY IF EXISTS "user_roles_insert_authenticated" ON user_roles;
DROP POLICY IF EXISTS "user_roles_update_authenticated" ON user_roles;
DROP POLICY IF EXISTS "user_roles_delete_authenticated" ON user_roles;

DROP POLICY IF EXISTS "roles_plataforma_select_authenticated" ON roles_plataforma;
DROP POLICY IF EXISTS "roles_plataforma_insert_authenticated" ON roles_plataforma;
DROP POLICY IF EXISTS "roles_plataforma_update_authenticated" ON roles_plataforma;
DROP POLICY IF EXISTS "roles_plataforma_delete_authenticated" ON roles_plataforma;

-- Eliminar políticas con nombres en español también
DROP POLICY IF EXISTS "Profiles son visibles para usuarios autenticados" ON profiles;
DROP POLICY IF EXISTS "Usuarios pueden crear su propio perfil" ON profiles;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON profiles;
DROP POLICY IF EXISTS "Usuarios pueden eliminar su propio perfil" ON profiles;

DROP POLICY IF EXISTS "User roles son visibles para usuarios autenticados" ON user_roles;
DROP POLICY IF EXISTS "User roles pueden ser creados por usuarios autenticados" ON user_roles;
DROP POLICY IF EXISTS "User roles pueden ser actualizados por usuarios autenticados" ON user_roles;
DROP POLICY IF EXISTS "User roles pueden ser eliminados por usuarios autenticados" ON user_roles;

DROP POLICY IF EXISTS "Roles plataforma son visibles para usuarios autenticados" ON roles_plataforma;
DROP POLICY IF EXISTS "Roles plataforma pueden ser creados por usuarios autenticados" ON roles_plataforma;
DROP POLICY IF EXISTS "Roles plataforma pueden ser actualizados por usuarios autenticados" ON roles_plataforma;
DROP POLICY IF EXISTS "Roles plataforma pueden ser eliminados por usuarios autenticados" ON roles_plataforma;

-- 2. Verificar que no quedan políticas
SELECT 'Políticas restantes:' as info;
SELECT 
    schemaname,
    tablename,
    policyname
FROM pg_policies 
WHERE tablename IN ('profiles', 'user_roles', 'roles_plataforma')
ORDER BY tablename, policyname;

-- 3. Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles_plataforma ENABLE ROW LEVEL SECURITY;

-- 4. Crear políticas básicas y seguras
-- Políticas para profiles
CREATE POLICY "profiles_select_policy" ON profiles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "profiles_insert_policy" ON profiles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "profiles_update_policy" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_delete_policy" ON profiles
    FOR DELETE USING (auth.uid() = id);

-- Políticas para user_roles
CREATE POLICY "user_roles_select_policy" ON user_roles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "user_roles_insert_policy" ON user_roles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "user_roles_update_policy" ON user_roles
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "user_roles_delete_policy" ON user_roles
    FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas para roles_plataforma
CREATE POLICY "roles_plataforma_select_policy" ON roles_plataforma
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "roles_plataforma_insert_policy" ON roles_plataforma
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "roles_plataforma_update_policy" ON roles_plataforma
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "roles_plataforma_delete_policy" ON roles_plataforma
    FOR DELETE USING (auth.role() = 'authenticated');

-- 5. Verificar que las políticas se crearon correctamente
SELECT 'Políticas creadas:' as info;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd
FROM pg_policies 
WHERE tablename IN ('profiles', 'user_roles', 'roles_plataforma')
ORDER BY tablename, policyname;

-- 6. Verificar que RLS está habilitado
SELECT 'Estado RLS:' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('profiles', 'user_roles', 'roles_plataforma')
ORDER BY tablename; -- Script para limpiar políticas existentes y configurar RLS correctamente
