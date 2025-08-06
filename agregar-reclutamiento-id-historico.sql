-- Agregar reclutamiento_id al historial

-- 1. AGREGAR COLUMNA RECLUTAMIENTO_ID
ALTER TABLE historial_participacion_participantes_internos 
ADD COLUMN IF NOT EXISTS reclutamiento_id UUID;

-- 2. VERIFICAR ESTRUCTURA ACTUALIZADA
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'historial_participacion_participantes_internos'
ORDER BY ordinal_position;

-- 3. LIMPIAR DATOS EXISTENTES (SI HAY)
DELETE FROM historial_participacion_participantes_internos;

-- 4. VERIFICAR TABLA VACÍA
SELECT 
    'TABLA VACÍA' as fuente,
    COUNT(*) as total_registros
FROM historial_participacion_participantes_internos; 