-- ====================================
-- AGREGAR COLUMNA COLOR A ESTADO_RECLUTAMIENTO_CAT
-- ====================================

-- 1. VERIFICAR SI LA COLUMNA COLOR EXISTE
SELECT '=== VERIFICAR COLUMNA COLOR ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'estado_reclutamiento_cat' 
AND table_schema = 'public'
AND column_name = 'color';

-- 2. AGREGAR COLUMNA COLOR SI NO EXISTE
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'estado_reclutamiento_cat' 
        AND table_schema = 'public'
        AND column_name = 'color'
    ) THEN
        ALTER TABLE estado_reclutamiento_cat ADD COLUMN color VARCHAR(7) DEFAULT '#6B7280';
        RAISE NOTICE 'Columna color agregada a estado_reclutamiento_cat';
    ELSE
        RAISE NOTICE 'La columna color ya existe en estado_reclutamiento_cat';
    END IF;
END $$;

-- 3. ACTUALIZAR COLORES PARA LOS ESTADOS EXISTENTES
UPDATE estado_reclutamiento_cat 
SET color = CASE 
    WHEN nombre ILIKE '%pendiente%' THEN '#F59E0B'
    WHEN nombre ILIKE '%progreso%' THEN '#3B82F6'
    WHEN nombre ILIKE '%completado%' THEN '#10B981'
    WHEN nombre ILIKE '%cancelado%' THEN '#EF4444'
    ELSE '#6B7280'
END
WHERE color IS NULL OR color = '#6B7280';

-- 4. VERIFICAR ESTRUCTURA FINAL
SELECT '=== ESTRUCTURA FINAL ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'estado_reclutamiento_cat' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. MOSTRAR DATOS CON COLORES
SELECT '=== DATOS CON COLORES ===' as info;

SELECT 
    id,
    nombre,
    descripcion,
    color,
    activo,
    orden,
    creado_en
FROM estado_reclutamiento_cat
ORDER BY orden;

-- 6. REFRESCAR CACHE DE ESQUEMAS
NOTIFY pgrst, 'reload schema';

SELECT 'Columna color agregada y actualizada correctamente' as mensaje; 