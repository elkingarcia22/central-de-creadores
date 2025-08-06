-- Políticas avanzadas de RLS con verificación de roles
-- Ejecutar DESPUÉS de enable-rls-secure.sql

-- 1. Función helper para verificar si un usuario tiene un rol específico
CREATE OR REPLACE FUNCTION user_has_role(role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles_plataforma rp ON ur.role = rp.nombre
    WHERE ur.user_id = auth.uid() 
    AND rp.nombre = role_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Función helper para verificar si un usuario es administrador
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN user_has_role('administrador');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Políticas más restrictivas para administradores (reemplazar las básicas)

-- Eliminar políticas básicas de roles_plataforma
DROP POLICY IF EXISTS "roles_plataforma_insert_authenticated" ON roles_plataforma;
DROP POLICY IF EXISTS "roles_plataforma_update_authenticated" ON roles_plataforma;
DROP POLICY IF EXISTS "roles_plataforma_delete_authenticated" ON roles_plataforma;

-- Crear políticas solo para administradores
CREATE POLICY "roles_plataforma_admin_only" ON roles_plataforma
    FOR ALL USING (is_admin());

-- 4. Políticas para user_roles más específicas
DROP POLICY IF EXISTS "user_roles_insert_authenticated" ON user_roles;
DROP POLICY IF EXISTS "user_roles_update_authenticated" ON user_roles;
DROP POLICY IF EXISTS "user_roles_delete_authenticated" ON user_roles;

-- Solo administradores pueden gestionar roles de usuarios
CREATE POLICY "user_roles_admin_management" ON user_roles
    FOR ALL USING (is_admin());

-- 5. Políticas para profiles más específicas
DROP POLICY IF EXISTS "profiles_insert_authenticated" ON profiles;

-- Permitir inserción solo a administradores o al propio usuario
CREATE POLICY "profiles_insert_owner_or_admin" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id OR is_admin());

-- 6. Políticas para bucket de avatares
-- Crear bucket si no existe
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas para storage
CREATE POLICY "avatars_select_public" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatars_insert_authenticated" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "avatars_update_owner" ON storage.objects
    FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "avatars_delete_owner_or_admin" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'avatars' AND 
        (auth.uid()::text = (storage.foldername(name))[1] OR is_admin())
    );

-- 7. Verificar todas las políticas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('profiles', 'user_roles', 'roles_plataforma')
   OR (schemaname = 'storage' AND tablename = 'objects')
ORDER BY tablename, policyname;

-- 8. Probar las funciones helper
SELECT 
    'is_admin()' as function_name,
    is_admin() as result
UNION ALL
SELECT 
    'user_has_role(''administrador'')' as function_name,
    user_has_role('administrador') as result; 