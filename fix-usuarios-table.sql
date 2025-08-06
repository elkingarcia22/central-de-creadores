-- Script para arreglar la tabla usuarios existente
-- Ejecuta esto en el SQL Editor de Supabase

-- Crear tabla profiles (reemplaza la tabla usuarios existente)
DROP TABLE IF EXISTS usuarios CASCADE;

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla roles_plataforma para definir los roles disponibles
CREATE TABLE IF NOT EXISTS roles_plataforma (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla user_roles para manejar roles de usuarios
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_full_name ON profiles(full_name);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_roles_plataforma_nombre ON roles_plataforma(nombre);

-- Habilitar RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles_plataforma ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para profiles
CREATE POLICY "Profiles son visibles para usuarios autenticados" ON profiles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios pueden crear su propio perfil" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuarios pueden actualizar su propio perfil" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Usuarios pueden eliminar su propio perfil" ON profiles
    FOR DELETE USING (auth.uid() = id);

-- Políticas de seguridad para user_roles
CREATE POLICY "User roles son visibles para usuarios autenticados" ON user_roles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "User roles pueden ser creados por usuarios autenticados" ON user_roles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "User roles pueden ser actualizados por usuarios autenticados" ON user_roles
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "User roles pueden ser eliminados por usuarios autenticados" ON user_roles
    FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas de seguridad para roles_plataforma
CREATE POLICY "Roles plataforma son visibles para usuarios autenticados" ON roles_plataforma
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Roles plataforma pueden ser creados por usuarios autenticados" ON roles_plataforma
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Roles plataforma pueden ser actualizados por usuarios autenticados" ON roles_plataforma
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Roles plataforma pueden ser eliminados por usuarios autenticados" ON roles_plataforma
    FOR DELETE USING (auth.role() = 'authenticated');

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at 
    BEFORE UPDATE ON user_roles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_plataforma_updated_at 
    BEFORE UPDATE ON roles_plataforma 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Crear bucket para avatares si no existe
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Política para permitir acceso público a avatares
CREATE POLICY "Avatares son públicos" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

-- Política para permitir subida de avatares a usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden subir avatares" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Política para permitir actualización de avatares a propietarios
CREATE POLICY "Propietarios pueden actualizar avatares" ON storage.objects
    FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Política para permitir eliminación de avatares a propietarios
CREATE POLICY "Propietarios pueden eliminar avatares" ON storage.objects
    FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Insertar roles básicos de la plataforma
INSERT INTO roles_plataforma (nombre, descripcion) VALUES
    ('administrador', 'Administrador del sistema con acceso completo'),
    ('investigador', 'Investigador que puede crear y gestionar investigaciones'),
    ('reclutador', 'Reclutador que puede gestionar participantes'),
    ('analista', 'Analista que puede ver métricas y reportes'),
    ('participante', 'Participante que puede responder encuestas')
ON CONFLICT (nombre) DO NOTHING;

-- Verificar la estructura final
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position; 