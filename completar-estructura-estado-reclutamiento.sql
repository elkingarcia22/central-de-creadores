-- ====================================
-- COMPLETAR ESTRUCTURA ESTADO_RECLUTAMIENTO_CAT
-- ====================================

-- 1. VERIFICAR ESTRUCTURA ACTUAL
SELECT '=== ESTRUCTURA ACTUAL ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'estado_reclutamiento_cat' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. AGREGAR COLUMNA DESCRIPCION SI NO EXISTE
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'estado_reclutamiento_cat' 
        AND table_schema = 'public'
        AND column_name = 'descripcion'
    ) THEN
        ALTER TABLE estado_reclutamiento_cat ADD COLUMN descripcion TEXT;
        RAISE NOTICE 'Columna descripcion agregada a estado_reclutamiento_cat';
    ELSE
        RAISE NOTICE 'La columna descripcion ya existe en estado_reclutamiento_cat';
    END IF;
END $$;

-- 3. AGREGAR COLUMNA COLOR SI NO EXISTE
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

-- 4. AGREGAR COLUMNA ORDEN SI NO EXISTE
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

-- 5. AGREGAR COLUMNA ACTIVO SI NO EXISTE
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'estado_reclutamiento_cat' 
        AND table_schema = 'public'
        AND column_name = 'activo'
    ) THEN
        ALTER TABLE estado_reclutamiento_cat ADD COLUMN activo BOOLEAN DEFAULT true;
        RAISE NOTICE 'Columna activo agregada a estado_reclutamiento_cat';
    ELSE
        RAISE NOTICE 'La columna activo ya existe en estado_reclutamiento_cat';
    END IF;
END $$;

-- 6. AGREGAR COLUMNA CREADO_EN SI NO EXISTE
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'estado_reclutamiento_cat' 
        AND table_schema = 'public'
        AND column_name = 'creado_en'
    ) THEN
        ALTER TABLE estado_reclutamiento_cat ADD COLUMN creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Columna creado_en agregada a estado_reclutamiento_cat';
    ELSE
        RAISE NOTICE 'La columna creado_en ya existe en estado_reclutamiento_cat';
    END IF;
END $$;

-- 7. ACTUALIZAR DESCRIPCIONES PARA LOS ESTADOS EXISTENTES
UPDATE estado_reclutamiento_cat 
SET descripcion = CASE 
    WHEN nombre ILIKE '%pendiente%' THEN 'Reclutamiento pendiente de iniciar'
    WHEN nombre ILIKE '%progreso%' THEN 'Reclutamiento en curso'
    WHEN nombre ILIKE '%completado%' THEN 'Reclutamiento finalizado exitosamente'
    WHEN nombre ILIKE '%cancelado%' THEN 'Reclutamiento cancelado'
    ELSE 'Estado de reclutamiento'
END
WHERE descripcion IS NULL;

-- 8. ACTUALIZAR COLORES PARA LOS ESTADOS EXISTENTES
UPDATE estado_reclutamiento_cat 
SET color = CASE 
    WHEN nombre ILIKE '%pendiente%' THEN '#F59E0B'
    WHEN nombre ILIKE '%progreso%' THEN '#3B82F6'
    WHEN nombre ILIKE '%completado%' THEN '#10B981'
    WHEN nombre ILIKE '%cancelado%' THEN '#EF4444'
    ELSE '#6B7280'
END
WHERE color IS NULL OR color = '#6B7280';

-- 9. ACTUALIZAR ORDEN PARA LOS ESTADOS EXISTENTES
UPDATE estado_reclutamiento_cat 
SET orden = CASE 
    WHEN nombre ILIKE '%pendiente%' THEN 1
    WHEN nombre ILIKE '%progreso%' THEN 2
    WHEN nombre ILIKE '%completado%' THEN 3
    WHEN nombre ILIKE '%cancelado%' THEN 4
    ELSE 99
END
WHERE orden IS NULL OR orden = 0;

-- 10. ACTUALIZAR ACTIVO PARA LOS ESTADOS EXISTENTES
UPDATE estado_reclutamiento_cat 
SET activo = true
WHERE activo IS NULL;

-- 11. VERIFICAR ESTRUCTURA FINAL
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

-- 12. MOSTRAR DATOS COMPLETOS
SELECT '=== DATOS COMPLETOS ===' as info;

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

-- 13. REFRESCAR CACHE DE ESQUEMAS
NOTIFY pgrst, 'reload schema';

SELECT 'Estructura de estado_reclutamiento_cat completada correctamente' as mensaje; 