-- ====================================
-- ACTUALIZAR ESQUEMA TABLA LIBRETOS_INVESTIGACION
-- ====================================

-- 1. VERIFICAR Y AGREGAR COLUMNAS FALTANTES
-- Agregar columna duracion_estimada si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'libretos_investigacion' 
        AND column_name = 'duracion_estimada'
    ) THEN
        ALTER TABLE libretos_investigacion 
        ADD COLUMN duracion_estimada INTEGER;
        RAISE NOTICE 'Columna duracion_estimada agregada';
    ELSE
        RAISE NOTICE 'Columna duracion_estimada ya existe';
    END IF;
END $$;

-- Agregar columna link_prototipo si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'libretos_investigacion' 
        AND column_name = 'link_prototipo'
    ) THEN
        ALTER TABLE libretos_investigacion 
        ADD COLUMN link_prototipo TEXT;
        RAISE NOTICE 'Columna link_prototipo agregada';
    ELSE
        RAISE NOTICE 'Columna link_prototipo ya existe';
    END IF;
END $$;

-- Agregar columna tipo_prueba_id si no existe (para reemplazar tipo_prueba)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'libretos_investigacion' 
        AND column_name = 'tipo_prueba_id'
    ) THEN
        ALTER TABLE libretos_investigacion 
        ADD COLUMN tipo_prueba_id UUID;
        RAISE NOTICE 'Columna tipo_prueba_id agregada';
    ELSE
        RAISE NOTICE 'Columna tipo_prueba_id ya existe';
    END IF;
END $$;

-- Agregar columna pais_id si no existe (para reemplazar pais)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'libretos_investigacion' 
        AND column_name = 'pais_id'
    ) THEN
        ALTER TABLE libretos_investigacion 
        ADD COLUMN pais_id UUID;
        RAISE NOTICE 'Columna pais_id agregada';
    ELSE
        RAISE NOTICE 'Columna pais_id ya existe';
    END IF;
END $$;

-- 2. CREAR FOREIGN KEYS PARA NUEVAS COLUMNAS
-- FK para tipo_prueba_id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_libretos_tipo_prueba'
        AND table_name = 'libretos_investigacion'
    ) THEN
        ALTER TABLE libretos_investigacion 
        ADD CONSTRAINT fk_libretos_tipo_prueba 
        FOREIGN KEY (tipo_prueba_id) REFERENCES tipos_prueba_cat(id);
        RAISE NOTICE 'FK para tipo_prueba_id creada';
    ELSE
        RAISE NOTICE 'FK para tipo_prueba_id ya existe';
    END IF;
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Error creando FK para tipo_prueba_id: %', SQLERRM;
END $$;

-- FK para pais_id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_libretos_pais'
        AND table_name = 'libretos_investigacion'
    ) THEN
        ALTER TABLE libretos_investigacion 
        ADD CONSTRAINT fk_libretos_pais 
        FOREIGN KEY (pais_id) REFERENCES paises(id);
        RAISE NOTICE 'FK para pais_id creada';
    ELSE
        RAISE NOTICE 'FK para pais_id ya existe';
    END IF;
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Error creando FK para pais_id: %', SQLERRM;
END $$;

-- 3. VERIFICAR ESTRUCTURA FINAL
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'libretos_investigacion' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. REFRESCAR CACHE DE ESQUEMAS (SUPABASE)
-- Esto ayuda a que Supabase reconozca los cambios en el esquema
NOTIFY pgrst, 'reload schema'; 