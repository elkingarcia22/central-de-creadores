-- ====================================
-- CREAR SOLO ESTADO DE RECLUTAMIENTO Y VISTA
-- ====================================
-- Ejecutar en el SQL Editor de Supabase (asumiendo que libretos ya existe)

-- 1. Crear tabla de estado de reclutamiento si no existe
CREATE TABLE IF NOT EXISTS estado_reclutamiento_cat (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    color VARCHAR(7) DEFAULT '#6B7280',
    activo BOOLEAN DEFAULT true,
    orden INTEGER DEFAULT 0,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Insertar estados de reclutamiento básicos
INSERT INTO estado_reclutamiento_cat (nombre, descripcion, color, orden) VALUES
    ('Pendiente', 'Reclutamiento pendiente de iniciar', '#F59E0B', 1),
    ('En progreso', 'Reclutamiento en curso', '#3B82F6', 2),
    ('Completado', 'Reclutamiento finalizado exitosamente', '#10B981', 3),
    ('Cancelado', 'Reclutamiento cancelado', '#EF4444', 4)
ON CONFLICT (nombre) DO NOTHING;

-- 3. Agregar columna estado_reclutamiento a investigaciones si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'investigaciones' 
        AND column_name = 'estado_reclutamiento'
    ) THEN
        ALTER TABLE investigaciones ADD COLUMN estado_reclutamiento UUID REFERENCES estado_reclutamiento_cat(id);
    END IF;
END $$;

-- 4. Actualizar investigaciones por agendar con estado de reclutamiento por defecto
UPDATE investigaciones 
SET estado_reclutamiento = (SELECT id FROM estado_reclutamiento_cat WHERE nombre = 'Pendiente')
WHERE estado = 'por_agendar' 
AND estado_reclutamiento IS NULL;

-- 5. Verificar que las tablas se crearon correctamente
SELECT 'Estado de reclutamiento creado exitosamente' as resultado;

-- 6. Mostrar estructura de la tabla creada
SELECT 'Estructura de estado_reclutamiento_cat:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'estado_reclutamiento_cat' 
ORDER BY ordinal_position;

-- 7. Mostrar datos de ejemplo
SELECT 'Estados de reclutamiento:' as info;
SELECT * FROM estado_reclutamiento_cat ORDER BY orden; 