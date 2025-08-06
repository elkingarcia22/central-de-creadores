-- ====================================
-- CREAR TABLAS FALTANTES PARA RECLUTAMIENTO
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- 1. Crear tabla de libretos si no existe
CREATE TABLE IF NOT EXISTS libretos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    numero_participantes INTEGER DEFAULT 8,
    contenido TEXT,
    activo BOOLEAN DEFAULT true,
    creado_por UUID REFERENCES usuarios(id),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear tabla de estado de reclutamiento si no existe
CREATE TABLE IF NOT EXISTS estado_reclutamiento_cat (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    color VARCHAR(7) DEFAULT '#6B7280',
    activo BOOLEAN DEFAULT true,
    orden INTEGER DEFAULT 0,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Insertar estados de reclutamiento básicos
INSERT INTO estado_reclutamiento_cat (nombre, descripcion, color, orden) VALUES
    ('Pendiente', 'Reclutamiento pendiente de iniciar', '#F59E0B', 1),
    ('En progreso', 'Reclutamiento en curso', '#3B82F6', 2),
    ('Completado', 'Reclutamiento finalizado exitosamente', '#10B981', 3),
    ('Cancelado', 'Reclutamiento cancelado', '#EF4444', 4)
ON CONFLICT (nombre) DO NOTHING;

-- 4. Agregar columna estado_reclutamiento a investigaciones si no existe
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

-- 5. Actualizar investigaciones por agendar con estado de reclutamiento por defecto
UPDATE investigaciones 
SET estado_reclutamiento = (SELECT id FROM estado_reclutamiento_cat WHERE nombre = 'Pendiente')
WHERE estado = 'por_agendar' 
AND estado_reclutamiento IS NULL;

-- 6. Crear algunos libretos de ejemplo si no existen
INSERT INTO libretos (titulo, descripcion, numero_participantes, contenido) VALUES
    ('Libreto 1', 'Investigación de usabilidad de productos digitales', 8, 'Contenido del libreto 1'),
    ('Libreto 2', 'Estudio de satisfacción del cliente', 6, 'Contenido del libreto 2'),
    ('Libreto 3', 'Análisis de comportamiento de usuarios', 10, 'Contenido del libreto 3')
ON CONFLICT DO NOTHING;

-- 7. Verificar que las tablas se crearon correctamente
SELECT 'Tablas creadas exitosamente' as resultado;

-- 8. Mostrar estructura de las tablas creadas
SELECT 'Estructura de libretos:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'libretos' 
ORDER BY ordinal_position;

SELECT 'Estructura de estado_reclutamiento_cat:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'estado_reclutamiento_cat' 
ORDER BY ordinal_position;

-- 9. Mostrar datos de ejemplo
SELECT 'Estados de reclutamiento:' as info;
SELECT * FROM estado_reclutamiento_cat ORDER BY orden;

SELECT 'Libretos creados:' as info;
SELECT * FROM libretos LIMIT 3; 