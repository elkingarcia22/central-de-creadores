-- ====================================
-- CORREGIR TABLA SEGUIMIENTOS_INVESTIGACION
-- ====================================

-- 1. Verificar si la tabla existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'seguimientos_investigacion' 
        AND table_schema = 'public'
    ) THEN
        RAISE NOTICE 'Tabla seguimientos_investigacion existe ✓';
    ELSE
        RAISE NOTICE 'Tabla seguimientos_investigacion NO existe';
    END IF;
END $$;

-- 2. Si la tabla existe, eliminar foreign keys problemáticas
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    -- Buscar y eliminar foreign keys problemáticas
    FOR constraint_record IN 
        SELECT tc.constraint_name
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' 
          AND tc.table_name = 'seguimientos_investigacion'
          AND kcu.column_name IN ('responsable_id', 'creado_por')
    LOOP
        EXECUTE 'ALTER TABLE seguimientos_investigacion DROP CONSTRAINT ' || constraint_record.constraint_name;
        RAISE NOTICE 'Eliminada foreign key: %', constraint_record.constraint_name;
    END LOOP;
END $$;

-- 3. Crear la tabla si no existe, o agregar columnas faltantes
CREATE TABLE IF NOT EXISTS seguimientos_investigacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigacion_id UUID NOT NULL,
    fecha_seguimiento DATE NOT NULL,
    notas TEXT NOT NULL,
    responsable_id UUID NOT NULL,
    estado VARCHAR(50) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_progreso', 'completado', 'bloqueado', 'cancelado')),
    creado_por UUID NOT NULL,
    creado_el TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_el TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Agregar columnas si no existen
ALTER TABLE seguimientos_investigacion 
ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();

ALTER TABLE seguimientos_investigacion 
ADD COLUMN IF NOT EXISTS investigacion_id UUID;

ALTER TABLE seguimientos_investigacion 
ADD COLUMN IF NOT EXISTS fecha_seguimiento DATE;

ALTER TABLE seguimientos_investigacion 
ADD COLUMN IF NOT EXISTS notas TEXT;

ALTER TABLE seguimientos_investigacion 
ADD COLUMN IF NOT EXISTS responsable_id UUID;

ALTER TABLE seguimientos_investigacion 
ADD COLUMN IF NOT EXISTS estado VARCHAR(50) DEFAULT 'pendiente';

ALTER TABLE seguimientos_investigacion 
ADD COLUMN IF NOT EXISTS creado_por UUID;

ALTER TABLE seguimientos_investigacion 
ADD COLUMN IF NOT EXISTS creado_el TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE seguimientos_investigacion 
ADD COLUMN IF NOT EXISTS actualizado_el TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 5. Agregar PRIMARY KEY si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'seguimientos_investigacion' 
        AND constraint_type = 'PRIMARY KEY'
    ) THEN
        ALTER TABLE seguimientos_investigacion ADD PRIMARY KEY (id);
    END IF;
END $$;

-- 6. Crear foreign keys correctas
DO $$ 
BEGIN
    -- FK para investigacion_id
    BEGIN
        ALTER TABLE seguimientos_investigacion 
        ADD CONSTRAINT fk_seguimientos_investigacion 
        FOREIGN KEY (investigacion_id) REFERENCES investigaciones(id) ON DELETE CASCADE;
    EXCEPTION
        WHEN duplicate_object THEN NULL;
        WHEN others THEN 
            RAISE NOTICE 'No se pudo crear FK para investigacion_id: %', SQLERRM;
    END;

    -- FK para responsable_id (apuntando a profiles)
    BEGIN
        ALTER TABLE seguimientos_investigacion 
        ADD CONSTRAINT fk_seguimientos_responsable 
        FOREIGN KEY (responsable_id) REFERENCES profiles(id) ON DELETE RESTRICT;
    EXCEPTION
        WHEN duplicate_object THEN NULL;
        WHEN others THEN 
            RAISE NOTICE 'No se pudo crear FK para responsable_id: %', SQLERRM;
    END;

    -- FK para creado_por (apuntando a profiles)
    BEGIN
        ALTER TABLE seguimientos_investigacion 
        ADD CONSTRAINT fk_seguimientos_creado_por 
        FOREIGN KEY (creado_por) REFERENCES profiles(id) ON DELETE RESTRICT;
    EXCEPTION
        WHEN duplicate_object THEN NULL;
        WHEN others THEN 
            RAISE NOTICE 'No se pudo crear FK para creado_por: %', SQLERRM;
    END;
END $$;

-- 7. Crear índices
CREATE INDEX IF NOT EXISTS idx_seguimientos_investigacion_id 
    ON seguimientos_investigacion(investigacion_id);

CREATE INDEX IF NOT EXISTS idx_seguimientos_fecha 
    ON seguimientos_investigacion(fecha_seguimiento);

CREATE INDEX IF NOT EXISTS idx_seguimientos_responsable 
    ON seguimientos_investigacion(responsable_id);

CREATE INDEX IF NOT EXISTS idx_seguimientos_creado_por 
    ON seguimientos_investigacion(creado_por);

-- 8. Habilitar RLS
ALTER TABLE seguimientos_investigacion ENABLE ROW LEVEL SECURITY;

-- 9. Crear políticas RLS (ignorar si ya existen)
DO $$
BEGIN
    -- Política para SELECT
    BEGIN
        CREATE POLICY "Usuarios autenticados pueden ver seguimientos" ON seguimientos_investigacion
            FOR SELECT USING (auth.role() = 'authenticated');
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;

    -- Política para INSERT
    BEGIN
        CREATE POLICY "Usuarios autenticados pueden crear seguimientos" ON seguimientos_investigacion
            FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;

    -- Política para UPDATE
    BEGIN
        CREATE POLICY "Usuarios autenticados pueden actualizar seguimientos" ON seguimientos_investigacion
            FOR UPDATE USING (auth.role() = 'authenticated');
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;

    -- Política para DELETE
    BEGIN
        CREATE POLICY "Usuarios autenticados pueden eliminar seguimientos" ON seguimientos_investigacion
            FOR DELETE USING (auth.role() = 'authenticated');
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
END $$;

-- 10. Verificar estructura final
SELECT 
    'Tabla seguimientos_investigacion corregida exitosamente' as mensaje,
    COUNT(*) as total_registros
FROM seguimientos_investigacion;

-- 11. Mostrar estructura final
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'seguimientos_investigacion' 
AND table_schema = 'public'
ORDER BY ordinal_position; 