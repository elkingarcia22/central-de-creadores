-- Script para habilitar RLS con políticas seguras
-- Ejecutar en el SQL Editor de Supabase

-- 1. Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles_plataforma ENABLE ROW LEVEL SECURITY;

-- 2. Políticas para profiles
-- Permitir lectura a usuarios autenticados
CREATE POLICY "profiles_select_authenticated" ON profiles
    FOR SELECT USING (auth.role() = 'authenticated');

-- Permitir inserción solo a usuarios autenticados (para crear perfiles)
CREATE POLICY "profiles_insert_authenticated" ON profiles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Permitir actualización solo al propietario del perfil
CREATE POLICY "profiles_update_owner" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Permitir eliminación solo al propietario del perfil
CREATE POLICY "profiles_delete_owner" ON profiles
    FOR DELETE USING (auth.uid() = id);

-- 3. Políticas para roles_plataforma
-- Permitir lectura a usuarios autenticados
CREATE POLICY "roles_plataforma_select_authenticated" ON roles_plataforma
    FOR SELECT USING (auth.role() = 'authenticated');

-- Permitir inserción solo a administradores (opcional, para desarrollo permitimos a autenticados)
CREATE POLICY "roles_plataforma_insert_authenticated" ON roles_plataforma
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Permitir actualización solo a administradores (opcional, para desarrollo permitimos a autenticados)
CREATE POLICY "roles_plataforma_update_authenticated" ON roles_plataforma
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Permitir eliminación solo a administradores (opcional, para desarrollo permitimos a autenticados)
CREATE POLICY "roles_plataforma_delete_authenticated" ON roles_plataforma
    FOR DELETE USING (auth.role() = 'authenticated');

-- 4. Políticas para user_roles
-- Permitir lectura a usuarios autenticados
CREATE POLICY "user_roles_select_authenticated" ON user_roles
    FOR SELECT USING (auth.role() = 'authenticated');

-- Permitir inserción a usuarios autenticados (para asignar roles)
CREATE POLICY "user_roles_insert_authenticated" ON user_roles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Permitir actualización a usuarios autenticados
CREATE POLICY "user_roles_update_authenticated" ON user_roles
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Permitir eliminación a usuarios autenticados
CREATE POLICY "user_roles_delete_authenticated" ON user_roles
    FOR DELETE USING (auth.role() = 'authenticated');

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

-- 6. Verificar que RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('profiles', 'user_roles', 'roles_plataforma')
ORDER BY tablename; 