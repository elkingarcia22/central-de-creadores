-- ====================================
-- ACTUALIZAR ESTADOS RECLUTAMIENTO EXISTENTES
-- ====================================

-- 1. VERIFICAR DATOS ACTUALES
SELECT '=== DATOS ACTUALES ===' as info;

SELECT * FROM estado_reclutamiento_cat
ORDER BY nombre;

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

-- 5. AGREGAR COLUMNA CREADO_EN SI NO EXISTE
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

-- 6. ACTUALIZAR DESCRIPCIONES PARA LOS ESTADOS EXISTENTES
UPDATE estado_reclutamiento_cat 
SET descripcion = CASE 
    WHEN nombre = 'Por iniciar' THEN 'Reclutamiento pendiente de iniciar'
    WHEN nombre = 'En progreso' THEN 'Reclutamiento en curso'
    WHEN nombre = 'Agendada' THEN 'Reclutamiento agendado y listo'
    ELSE 'Estado de reclutamiento'
END
WHERE descripcion IS NULL;

-- 7. ACTUALIZAR COLORES PARA LOS ESTADOS EXISTENTES
UPDATE estado_reclutamiento_cat 
SET color = CASE 
    WHEN nombre = 'Por iniciar' THEN '#F59E0B'
    WHEN nombre = 'En progreso' THEN '#3B82F6'
    WHEN nombre = 'Agendada' THEN '#10B981'
    ELSE '#6B7280'
END
WHERE color IS NULL OR color = '#6B7280';

-- 8. ACTUALIZAR ORDEN PARA LOS ESTADOS EXISTENTES
UPDATE estado_reclutamiento_cat 
SET orden = CASE 
    WHEN nombre = 'Por iniciar' THEN 1
    WHEN nombre = 'En progreso' THEN 2
    WHEN nombre = 'Agendada' THEN 3
    ELSE 99
END
WHERE orden IS NULL OR orden = 0;

-- 9. ACTUALIZAR CREADO_EN PARA LOS ESTADOS EXISTENTES
UPDATE estado_reclutamiento_cat 
SET creado_en = NOW()
WHERE creado_en IS NULL;

-- 10. VERIFICAR ESTRUCTURA FINAL
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

-- 11. MOSTRAR DATOS COMPLETOS ACTUALIZADOS
SELECT '=== DATOS COMPLETOS ACTUALIZADOS ===' as info;

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

-- 12. REFRESCAR CACHE DE ESQUEMAS
NOTIFY pgrst, 'reload schema';

SELECT 'Estados de reclutamiento actualizados correctamente' as mensaje; 