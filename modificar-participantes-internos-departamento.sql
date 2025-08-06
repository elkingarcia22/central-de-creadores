-- ====================================
-- MODIFICAR PARTICIPANTES INTERNOS PARA DEPARTAMENTOS
-- ====================================
-- Ejecutar en el SQL Editor de Supabase después de crear la tabla departamentos

-- 1. Agregar columna departamento_id a la tabla participantes_internos
ALTER TABLE participantes_internos 
ADD COLUMN IF NOT EXISTS departamento_id UUID REFERENCES departamentos(id);

-- 2. Crear índice para la nueva columna
CREATE INDEX IF NOT EXISTS idx_participantes_internos_departamento 
ON participantes_internos(departamento_id);

-- 3. Migrar datos existentes (asignar "Otro" a departamentos existentes)
UPDATE participantes_internos 
SET departamento_id = (
    SELECT id FROM departamentos 
    WHERE nombre = 'Otro' 
    LIMIT 1
)
WHERE departamento_id IS NULL 
AND departamento IS NOT NULL;

-- 4. Opcional: Eliminar la columna departamento anterior (descomentar si se desea)
-- ALTER TABLE participantes_internos DROP COLUMN IF EXISTS departamento;

-- 5. Verificar la nueva estructura
SELECT 'Tabla participantes_internos modificada exitosamente' as resultado;

-- 6. Mostrar la nueva estructura
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'participantes_internos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 7. Mostrar algunos datos con la nueva relación
SELECT 'Datos con departamentos:' as info;
SELECT 
    pi.id,
    pi.nombre,
    pi.email,
    d.nombre as departamento_nombre,
    d.categoria as departamento_categoria
FROM participantes_internos pi
LEFT JOIN departamentos d ON pi.departamento_id = d.id
LIMIT 10; 