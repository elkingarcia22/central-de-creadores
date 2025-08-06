-- Script para verificar y corregir la tabla profiles
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar si la tabla profiles existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
        RAISE NOTICE 'La tabla profiles no existe. Creándola...';
        
        CREATE TABLE profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            email VARCHAR(255) UNIQUE NOT NULL,
            full_name VARCHAR(255) NOT NULL,
            avatar_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE 'Tabla profiles creada exitosamente';
    ELSE
        RAISE NOTICE 'La tabla profiles ya existe';
    END IF;
END $$;

-- 2. Verificar y agregar columnas faltantes
DO $$
BEGIN
    -- Verificar columna avatar_url
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
        RAISE NOTICE 'Columna avatar_url agregada';
    ELSE
        RAISE NOTICE 'Columna avatar_url ya existe';
    END IF;
    
    -- Verificar columna full_name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'full_name') THEN
        ALTER TABLE profiles ADD COLUMN full_name VARCHAR(255);
        RAISE NOTICE 'Columna full_name agregada';
    ELSE
        RAISE NOTICE 'Columna full_name ya existe';
    END IF;
    
    -- Verificar columna created_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'created_at') THEN
        ALTER TABLE profiles ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Columna created_at agregada';
    ELSE
        RAISE NOTICE 'Columna created_at ya existe';
    END IF;
    
    -- Verificar columna updated_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'updated_at') THEN
        ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Columna updated_at agregada';
    ELSE
        RAISE NOTICE 'Columna updated_at ya existe';
    END IF;
END $$;

-- 3. Verificar si la tabla roles_plataforma existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'roles_plataforma') THEN
        RAISE NOTICE 'La tabla roles_plataforma no existe. Creándola...';
        
        CREATE TABLE roles_plataforma (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            nombre VARCHAR(100) NOT NULL UNIQUE,
            descripcion TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE 'Tabla roles_plataforma creada exitosamente';
    ELSE
        RAISE NOTICE 'La tabla roles_plataforma ya existe';
    END IF;
END $$;

-- 4. Verificar si la tabla user_roles existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_roles') THEN
        RAISE NOTICE 'La tabla user_roles no existe. Creándola...';
        
        CREATE TABLE user_roles (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
            role VARCHAR(50) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, role)
        );
        
        RAISE NOTICE 'Tabla user_roles creada exitosamente';
    ELSE
        RAISE NOTICE 'La tabla user_roles ya existe';
    END IF;
END $$;

-- 5. Insertar roles básicos si no existen
INSERT INTO roles_plataforma (nombre, descripcion) VALUES
    ('administrador', 'Administrador del sistema con acceso completo'),
    ('investigador', 'Investigador que puede crear y gestionar investigaciones'),
    ('reclutador', 'Reclutador que puede gestionar participantes'),
    ('analista', 'Analista que puede ver métricas y reportes'),
    ('participante', 'Participante que puede responder encuestas')
ON CONFLICT (nombre) DO NOTHING;

-- 6. Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles_plataforma ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- 7. Crear políticas de seguridad básicas
DO $$
BEGIN
    -- Políticas para profiles
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Profiles son visibles para usuarios autenticados') THEN
        CREATE POLICY "Profiles son visibles para usuarios autenticados" ON profiles
            FOR SELECT USING (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Usuarios pueden crear su propio perfil') THEN
        CREATE POLICY "Usuarios pueden crear su propio perfil" ON profiles
            FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
    
    -- Políticas para roles_plataforma
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'roles_plataforma' AND policyname = 'Roles plataforma son visibles para usuarios autenticados') THEN
        CREATE POLICY "Roles plataforma son visibles para usuarios autenticados" ON roles_plataforma
            FOR SELECT USING (auth.role() = 'authenticated');
    END IF;
    
    -- Políticas para user_roles
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'User roles son visibles para usuarios autenticados') THEN
        CREATE POLICY "User roles son visibles para usuarios autenticados" ON user_roles
            FOR SELECT USING (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'User roles pueden ser creados por usuarios autenticados') THEN
        CREATE POLICY "User roles pueden ser creados por usuarios autenticados" ON user_roles
            FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;
END $$;

-- 8. Mostrar la estructura final de la tabla profiles
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 9. Mostrar los roles disponibles
SELECT id, nombre, descripcion FROM roles_plataforma ORDER BY nombre; 