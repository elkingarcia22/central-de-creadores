-- ====================================
-- MODIFICAR TABLA RECLUTAMIENTOS - SEPARAR INTERNOS/EXTERNOS
-- ====================================
-- Ejecutar en Supabase SQL Editor
-- Agregar columna para participantes internos

-- PASO 1: Verificar estructura actual
SELECT '=== ESTRUCTURA ACTUAL DE RECLUTAMIENTOS ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'reclutamientos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- PASO 2: Agregar columna para participantes internos
SELECT '=== AGREGANDO COLUMNA PARTICIPANTES_INTERNOS_ID ===' as info;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reclutamientos' 
        AND column_name = 'participantes_internos_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE reclutamientos ADD COLUMN participantes_internos_id UUID;
        RAISE NOTICE '✅ Columna participantes_internos_id agregada';
    ELSE
        RAISE NOTICE '✅ Columna participantes_internos_id ya existe';
    END IF;
END $$;

-- PASO 3: Agregar foreign key para participantes_internos_id
SELECT '=== AGREGANDO FOREIGN KEY ===' as info;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'reclutamientos_participantes_internos_id_fkey'
        AND table_name = 'reclutamientos'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE reclutamientos 
        ADD CONSTRAINT reclutamientos_participantes_internos_id_fkey 
        FOREIGN KEY (participantes_internos_id) REFERENCES participantes_internos(id);
        RAISE NOTICE '✅ Foreign key agregada';
    ELSE
        RAISE NOTICE '✅ Foreign key ya existe';
    END IF;
END $$;

-- PASO 4: Agregar columna tipo_participante si no existe
SELECT '=== AGREGANDO COLUMNA TIPO_PARTICIPANTE ===' as info;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reclutamientos' 
        AND column_name = 'tipo_participante'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE reclutamientos ADD COLUMN tipo_participante TEXT CHECK (tipo_participante IN ('interno', 'externo'));
        RAISE NOTICE '✅ Columna tipo_participante agregada';
    ELSE
        RAISE NOTICE '✅ Columna tipo_participante ya existe';
    END IF;
END $$;

-- PASO 5: Verificar estructura final
SELECT '=== ESTRUCTURA FINAL DE RECLUTAMIENTOS ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'reclutamientos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- PASO 6: Verificar foreign keys
SELECT '=== FOREIGN KEYS DE RECLUTAMIENTOS ===' as info;

SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'reclutamientos'; 