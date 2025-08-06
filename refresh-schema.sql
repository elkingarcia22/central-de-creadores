-- Script para refrescar el schema cache y verificar la estructura
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar que la columna avatar_url existe en profiles
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 2. Verificar que el bucket avatars existe
SELECT name, public FROM storage.buckets WHERE name = 'avatars';

-- 3. Si el bucket no existe, crearlo
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- 4. Verificar que las políticas RLS están correctas para profiles
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';

-- 5. Asegurar que hay una política para UPDATE en profiles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND cmd = 'UPDATE') THEN
        CREATE POLICY "Usuarios pueden actualizar su propio perfil" ON profiles
            FOR UPDATE USING (auth.uid() = id);
    END IF;
END $$;

-- 6. Mostrar el estado final
SELECT 'Schema verification complete' as status; 