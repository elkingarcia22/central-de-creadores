-- Crear tabla usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar TEXT,
    roles TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_created_at ON usuarios(created_at);
CREATE INDEX IF NOT EXISTS idx_usuarios_nombre ON usuarios(nombre);

-- Habilitar RLS (Row Level Security)
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad básicas (ajustar según necesidades)
-- Permitir lectura a todos los usuarios autenticados
CREATE POLICY "Usuarios son visibles para usuarios autenticados" ON usuarios
    FOR SELECT USING (auth.role() = 'authenticated');

-- Permitir inserción solo a usuarios autenticados
CREATE POLICY "Usuarios pueden ser creados por usuarios autenticados" ON usuarios
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Permitir actualización solo al propietario del registro
CREATE POLICY "Usuarios pueden ser actualizados por el propietario" ON usuarios
    FOR UPDATE USING (auth.uid() = id);

-- Permitir eliminación solo al propietario del registro
CREATE POLICY "Usuarios pueden ser eliminados por el propietario" ON usuarios
    FOR DELETE USING (auth.uid() = id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at
CREATE TRIGGER update_usuarios_updated_at 
    BEFORE UPDATE ON usuarios 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insertar algunos usuarios de prueba (opcional)
INSERT INTO usuarios (nombre, email, roles) VALUES
    ('Administrador', 'admin@example.com', ARRAY['administrador']),
    ('Investigador', 'investigador@example.com', ARRAY['investigador']),
    ('Reclutador', 'reclutador@example.com', ARRAY['reclutador'])
ON CONFLICT (email) DO NOTHING; 