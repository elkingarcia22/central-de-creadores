-- ====================================
-- RECREAR TABLA SEGUIMIENTOS_INVESTIGACION
-- ====================================

-- 1. Eliminar la tabla si existe (esto eliminará todos los datos)
DROP TABLE IF EXISTS seguimientos_investigacion CASCADE;

-- 2. Crear la tabla con la estructura correcta
CREATE TABLE seguimientos_investigacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigacion_id UUID NOT NULL,
    fecha_seguimiento DATE NOT NULL,
    notas TEXT NOT NULL,
    responsable_id UUID NOT NULL,
    estado VARCHAR(50) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_progreso', 'completado', 'bloqueado', 'cancelado')),
    creado_por UUID NOT NULL,
    creado_el TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_el TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign keys correctas
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

-- 3. Crear índices para mejor rendimiento
CREATE INDEX idx_seguimientos_investigacion_id 
    ON seguimientos_investigacion(investigacion_id);

CREATE INDEX idx_seguimientos_fecha 
    ON seguimientos_investigacion(fecha_seguimiento);

CREATE INDEX idx_seguimientos_responsable 
    ON seguimientos_investigacion(responsable_id);

CREATE INDEX idx_seguimientos_creado_por 
    ON seguimientos_investigacion(creado_por);

-- 4. Habilitar RLS
ALTER TABLE seguimientos_investigacion ENABLE ROW LEVEL SECURITY;

-- 5. Crear políticas RLS
CREATE POLICY "Usuarios autenticados pueden ver seguimientos" ON seguimientos_investigacion
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden crear seguimientos" ON seguimientos_investigacion
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar seguimientos" ON seguimientos_investigacion
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden eliminar seguimientos" ON seguimientos_investigacion
    FOR DELETE USING (auth.role() = 'authenticated');

-- 6. Verificar que la tabla se creó correctamente
SELECT 
    'Tabla seguimientos_investigacion recreada exitosamente' as mensaje,
    COUNT(*) as total_registros
FROM seguimientos_investigacion;

-- 7. Mostrar estructura final
SELECT 
    'Estructura final:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'seguimientos_investigacion' 
AND table_schema = 'public'
ORDER BY ordinal_position; 