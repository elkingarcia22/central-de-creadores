-- ====================================
-- MIGRACIÓN COMPLETA TABLA LIBRETOS_INVESTIGACION
-- ====================================

-- 1. AGREGAR TODAS LAS COLUMNAS NECESARIAS

-- Columnas básicas
ALTER TABLE libretos_investigacion ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();
ALTER TABLE libretos_investigacion ADD COLUMN IF NOT EXISTS investigacion_id UUID;

-- Contenido del libreto
ALTER TABLE libretos_investigacion ADD COLUMN IF NOT EXISTS problema_situacion TEXT;
ALTER TABLE libretos_investigacion ADD COLUMN IF NOT EXISTS hipotesis TEXT;
ALTER TABLE libretos_investigacion ADD COLUMN IF NOT EXISTS objetivos TEXT;
ALTER TABLE libretos_investigacion ADD COLUMN IF NOT EXISTS resultado_esperado TEXT;
ALTER TABLE libretos_investigacion ADD COLUMN IF NOT EXISTS productos_recomendaciones TEXT;

-- Referencias a catálogos
ALTER TABLE libretos_investigacion ADD COLUMN IF NOT EXISTS plataforma_id UUID;
ALTER TABLE libretos_investigacion ADD COLUMN IF NOT EXISTS tipo_prueba_id UUID;
ALTER TABLE libretos_investigacion ADD COLUMN IF NOT EXISTS rol_empresa_id UUID;
ALTER TABLE libretos_investigacion ADD COLUMN IF NOT EXISTS industria_id UUID;
ALTER TABLE libretos_investigacion ADD COLUMN IF NOT EXISTS pais_id UUID;
ALTER TABLE libretos_investigacion ADD COLUMN IF NOT EXISTS modalidad_id UUID;
ALTER TABLE libretos_investigacion ADD COLUMN IF NOT EXISTS tamano_empresa_id UUID;

-- Configuración de la sesión
ALTER TABLE libretos_investigacion ADD COLUMN IF NOT EXISTS numero_participantes INTEGER;
ALTER TABLE libretos_investigacion ADD COLUMN IF NOT EXISTS nombre_sesion TEXT;
ALTER TABLE libretos_investigacion ADD COLUMN IF NOT EXISTS usuarios_participantes UUID[];
ALTER TABLE libretos_investigacion ADD COLUMN IF NOT EXISTS duracion_estimada INTEGER;
ALTER TABLE libretos_investigacion ADD COLUMN IF NOT EXISTS descripcion_general TEXT;
ALTER TABLE libretos_investigacion ADD COLUMN IF NOT EXISTS link_prototipo TEXT;

-- Metadatos
ALTER TABLE libretos_investigacion ADD COLUMN IF NOT EXISTS creado_por UUID;
ALTER TABLE libretos_investigacion ADD COLUMN IF NOT EXISTS creado_el TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE libretos_investigacion ADD COLUMN IF NOT EXISTS actualizado_el TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. AGREGAR PRIMARY KEY SI NO EXISTE
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'libretos_investigacion' 
        AND constraint_type = 'PRIMARY KEY'
    ) THEN
        ALTER TABLE libretos_investigacion ADD PRIMARY KEY (id);
    END IF;
END $$;

-- 3. CREAR FOREIGN KEYS (con manejo de errores)
DO $$ 
BEGIN
    -- FK para investigacion_id
    BEGIN
        ALTER TABLE libretos_investigacion 
        ADD CONSTRAINT fk_libretos_investigacion 
        FOREIGN KEY (investigacion_id) REFERENCES investigaciones(id);
    EXCEPTION
        WHEN duplicate_object THEN NULL;
        WHEN others THEN 
            RAISE NOTICE 'No se pudo crear FK para investigacion_id: %', SQLERRM;
    END;

    -- FK para plataforma_id
    BEGIN
        ALTER TABLE libretos_investigacion 
        ADD CONSTRAINT fk_libretos_plataforma 
        FOREIGN KEY (plataforma_id) REFERENCES plataformas_cat(id);
    EXCEPTION
        WHEN duplicate_object THEN NULL;
        WHEN others THEN 
            RAISE NOTICE 'No se pudo crear FK para plataforma_id: %', SQLERRM;
    END;

    -- FK para tipo_prueba_id
    BEGIN
        ALTER TABLE libretos_investigacion 
        ADD CONSTRAINT fk_libretos_tipo_prueba 
        FOREIGN KEY (tipo_prueba_id) REFERENCES tipos_prueba_cat(id);
    EXCEPTION
        WHEN duplicate_object THEN NULL;
        WHEN others THEN 
            RAISE NOTICE 'No se pudo crear FK para tipo_prueba_id: %', SQLERRM;
    END;

    -- FK para rol_empresa_id
    BEGIN
        ALTER TABLE libretos_investigacion 
        ADD CONSTRAINT fk_libretos_rol_empresa 
        FOREIGN KEY (rol_empresa_id) REFERENCES roles_empresa(id);
    EXCEPTION
        WHEN duplicate_object THEN NULL;
        WHEN others THEN 
            RAISE NOTICE 'No se pudo crear FK para rol_empresa_id: %', SQLERRM;
    END;

    -- FK para industria_id
    BEGIN
        ALTER TABLE libretos_investigacion 
        ADD CONSTRAINT fk_libretos_industria 
        FOREIGN KEY (industria_id) REFERENCES industrias(id);
    EXCEPTION
        WHEN duplicate_object THEN NULL;
        WHEN others THEN 
            RAISE NOTICE 'No se pudo crear FK para industria_id: %', SQLERRM;
    END;

    -- FK para pais_id
    BEGIN
        ALTER TABLE libretos_investigacion 
        ADD CONSTRAINT fk_libretos_pais 
        FOREIGN KEY (pais_id) REFERENCES paises(id);
    EXCEPTION
        WHEN duplicate_object THEN NULL;
        WHEN others THEN 
            RAISE NOTICE 'No se pudo crear FK para pais_id: %', SQLERRM;
    END;

    -- FK para modalidad_id
    BEGIN
        ALTER TABLE libretos_investigacion 
        ADD CONSTRAINT fk_libretos_modalidad 
        FOREIGN KEY (modalidad_id) REFERENCES modalidades(id);
    EXCEPTION
        WHEN duplicate_object THEN NULL;
        WHEN others THEN 
            RAISE NOTICE 'No se pudo crear FK para modalidad_id: %', SQLERRM;
    END;

    -- FK para tamano_empresa_id
    BEGIN
        ALTER TABLE libretos_investigacion 
        ADD CONSTRAINT fk_libretos_tamano_empresa 
        FOREIGN KEY (tamano_empresa_id) REFERENCES tamano_empresa(id);
    EXCEPTION
        WHEN duplicate_object THEN NULL;
        WHEN others THEN 
            RAISE NOTICE 'No se pudo crear FK para tamano_empresa_id: %', SQLERRM;
    END;
END $$;

-- 4. CREAR ÍNDICES
CREATE INDEX IF NOT EXISTS idx_libretos_investigacion_id ON libretos_investigacion(investigacion_id);
CREATE INDEX IF NOT EXISTS idx_libretos_creado_por ON libretos_investigacion(creado_por);
CREATE INDEX IF NOT EXISTS idx_libretos_creado_el ON libretos_investigacion(creado_el);

-- 5. VERIFICAR ESTRUCTURA FINAL
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'libretos_investigacion' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. REFRESCAR CACHE DE ESQUEMAS
NOTIFY pgrst, 'reload schema';

-- 7. MENSAJE FINAL
SELECT 'Tabla libretos_investigacion migrada completamente' as mensaje,
       COUNT(*) as total_columnas
FROM information_schema.columns 
WHERE table_name = 'libretos_investigacion' 
AND table_schema = 'public'; 