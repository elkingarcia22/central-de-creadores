-- ====================================
-- AGREGAR COLUMNA ORDEN A ESTADO_RECLUTAMIENTO_CAT
-- ====================================

-- 1. VERIFICAR SI LA COLUMNA ORDEN EXISTE
SELECT '=== VERIFICAR COLUMNA ORDEN ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'estado_reclutamiento_cat' 
AND table_schema = 'public'
AND column_name = 'orden';

-- 2. AGREGAR COLUMNA ORDEN SI NO EXISTE
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'estado_reclutamiento_cat' 
        AND table_schema = 'public'
        AND column_name = 'orden'
    ) THEN
        ALTER TABLE estado_reclutamiento_cat ADD COLUMN orden INTEGER DEFAULT 0;
        RAISE NOTICE 'Columna orden agregada a estado_reclutamiento_cat';
    ELSE
        RAISE NOTICE 'La columna orden ya existe en estado_reclutamiento_cat';
    END IF;
END $$;

-- 3. ACTUALIZAR ORDEN PARA LOS ESTADOS EXISTENTES
UPDATE estado_reclutamiento_cat 
SET orden = CASE 
    WHEN nombre ILIKE '%pendiente%' THEN 1
    WHEN nombre ILIKE '%progreso%' THEN 2
    WHEN nombre ILIKE '%completado%' THEN 3
    WHEN nombre ILIKE '%cancelado%' THEN 4
    ELSE 99
END
WHERE orden IS NULL OR orden = 0;

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

-- 5. MOSTRAR DATOS CON ORDEN
SELECT '=== DATOS CON ORDEN ===' as info;

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

SELECT 'Columna orden agregada y actualizada correctamente' as mensaje; 