-- ====================================
-- CREAR TABLA PARTICIPANTES INTERNOS
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- Crear tabla de participantes internos
CREATE TABLE IF NOT EXISTS participantes_internos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    apellidos TEXT,
    email TEXT UNIQUE NOT NULL,
    telefono TEXT,
    departamento TEXT,
    cargo TEXT,
    rol_empresa_id UUID REFERENCES roles_empresa(id),
    empresa_id UUID REFERENCES empresas(id),
    activo BOOLEAN DEFAULT true,
    fecha_ultima_participacion TIMESTAMP WITH TIME ZONE,
    total_participaciones INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    creado_por UUID REFERENCES usuarios(id)
);

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_participantes_internos_email ON participantes_internos(email);
CREATE INDEX IF NOT EXISTS idx_participantes_internos_activo ON participantes_internos(activo);
CREATE INDEX IF NOT EXISTS idx_participantes_internos_rol_empresa ON participantes_internos(rol_empresa_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE participantes_internos ENABLE ROW LEVEL SECURITY;

-- Crear políticas básicas de RLS
CREATE POLICY "Usuarios autenticados pueden ver participantes internos" ON participantes_internos
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden insertar participantes internos" ON participantes_internos
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar participantes internos" ON participantes_internos
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Verificar que la tabla se creó correctamente
SELECT 'Tabla participantes_internos creada exitosamente' as resultado;

-- Mostrar estructura de la tabla creada
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'participantes_internos' 
AND table_schema = 'public'
ORDER BY ordinal_position; 