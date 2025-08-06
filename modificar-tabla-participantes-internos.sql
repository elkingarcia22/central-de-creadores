-- ====================================
-- MODIFICAR TABLA PARTICIPANTES INTERNOS
-- ====================================
-- Ejecutar en el SQL Editor de Supabase
-- Este script quita los campos: apellidos, empresa, cargo, telefono

-- 1. Crear una nueva tabla con la estructura simplificada
CREATE TABLE IF NOT EXISTS participantes_internos_nueva (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    departamento TEXT,
    rol_empresa_id UUID REFERENCES roles_empresa(id),
    activo BOOLEAN DEFAULT true,
    fecha_ultima_participacion TIMESTAMP WITH TIME ZONE,
    total_participaciones INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    creado_por UUID REFERENCES usuarios(id)
);

-- 2. Migrar datos existentes (solo los campos que se mantienen)
INSERT INTO participantes_internos_nueva (
    id,
    nombre,
    email,
    departamento,
    rol_empresa_id,
    activo,
    fecha_ultima_participacion,
    total_participaciones,
    created_at,
    updated_at,
    creado_por
)
SELECT 
    id,
    nombre,
    email,
    departamento,
    rol_empresa_id,
    activo,
    fecha_ultima_participacion,
    total_participaciones,
    created_at,
    updated_at,
    creado_por
FROM participantes_internos;

-- 3. Eliminar la tabla antigua
DROP TABLE participantes_internos;

-- 4. Renombrar la nueva tabla
ALTER TABLE participantes_internos_nueva RENAME TO participantes_internos;

-- 5. Recrear índices
CREATE INDEX IF NOT EXISTS idx_participantes_internos_email ON participantes_internos(email);
CREATE INDEX IF NOT EXISTS idx_participantes_internos_activo ON participantes_internos(activo);
CREATE INDEX IF NOT EXISTS idx_participantes_internos_rol_empresa ON participantes_internos(rol_empresa_id);

-- 6. Habilitar RLS (Row Level Security)
ALTER TABLE participantes_internos ENABLE ROW LEVEL SECURITY;

-- 7. Recrear políticas básicas de RLS
CREATE POLICY "Usuarios autenticados pueden ver participantes internos" ON participantes_internos
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden insertar participantes internos" ON participantes_internos
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar participantes internos" ON participantes_internos
    FOR UPDATE USING (auth.role() = 'authenticated');

-- 8. Verificar la nueva estructura
SELECT 'Tabla participantes_internos modificada exitosamente' as resultado;

-- 9. Mostrar la nueva estructura de la tabla
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'participantes_internos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 10. Mostrar algunos datos de ejemplo
SELECT 'Datos de ejemplo:' as info;
SELECT id, nombre, email, departamento, rol_empresa_id, activo
FROM participantes_internos 
LIMIT 5; 