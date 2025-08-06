-- ====================================
-- CREAR TABLA SEGUIMIENTOS_INVESTIGACION
-- ====================================

-- 1. Crear tabla seguimientos_investigacion
CREATE TABLE IF NOT EXISTS seguimientos_investigacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigacion_id UUID NOT NULL,
    fecha_seguimiento DATE NOT NULL,
    notas TEXT NOT NULL,
    responsable_id UUID NOT NULL,
    estado VARCHAR(50) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_progreso', 'completado', 'bloqueado', 'cancelado')),
    creado_por UUID NOT NULL,
    creado_el TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_el TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign keys
    CONSTRAINT fk_seguimientos_investigacion 
        FOREIGN KEY (investigacion_id) 
        REFERENCES investigaciones(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_seguimientos_responsable 
        FOREIGN KEY (responsable_id) 
        REFERENCES profiles(id) 
        ON DELETE RESTRICT,
    
    CONSTRAINT fk_seguimientos_creado_por 
        FOREIGN KEY (creado_por) 
        REFERENCES profiles(id) 
        ON DELETE RESTRICT
);

-- 2. Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_seguimientos_investigacion_id 
    ON seguimientos_investigacion(investigacion_id);

CREATE INDEX IF NOT EXISTS idx_seguimientos_fecha 
    ON seguimientos_investigacion(fecha_seguimiento);

CREATE INDEX IF NOT EXISTS idx_seguimientos_responsable 
    ON seguimientos_investigacion(responsable_id);

CREATE INDEX IF NOT EXISTS idx_seguimientos_creado_por 
    ON seguimientos_investigacion(creado_por);

-- 3. Habilitar RLS (Row Level Security)
ALTER TABLE seguimientos_investigacion ENABLE ROW LEVEL SECURITY;

-- 4. Crear políticas RLS básicas
-- Política para permitir lectura a usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden ver seguimientos" ON seguimientos_investigacion
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política para permitir inserción a usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden crear seguimientos" ON seguimientos_investigacion
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para permitir actualización a usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden actualizar seguimientos" ON seguimientos_investigacion
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para permitir eliminación a usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden eliminar seguimientos" ON seguimientos_investigacion
    FOR DELETE USING (auth.role() = 'authenticated');

-- 5. Verificar que la tabla se creó correctamente
SELECT 
    'Tabla seguimientos_investigacion creada exitosamente' as mensaje,
    COUNT(*) as total_registros
FROM seguimientos_investigacion;

-- 6. Mostrar estructura de la tabla
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'seguimientos_investigacion' 
AND table_schema = 'public'
ORDER BY ordinal_position; 