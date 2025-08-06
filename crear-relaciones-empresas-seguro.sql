-- ====================================
-- SCRIPT SEGURO PARA CREAR RELACIONES EN TABLA EMPRESAS
-- ====================================

-- ====================================
-- 1. VERIFICAR RELACIONES EXISTENTES
-- ====================================

DO $$
DECLARE
    constraint_exists BOOLEAN;
BEGIN
    -- Verificar si ya existe la relación con estado_empresa
    SELECT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_empresas_estado' 
        AND table_name = 'empresas'
    ) INTO constraint_exists;
    
    IF NOT constraint_exists THEN
        ALTER TABLE empresas ADD CONSTRAINT fk_empresas_estado 
        FOREIGN KEY (estado) REFERENCES estado_empresa(id);
        RAISE NOTICE 'Foreign key fk_empresas_estado creada exitosamente';
    ELSE
        RAISE NOTICE 'Foreign key fk_empresas_estado ya existe';
    END IF;
    
    -- Verificar si ya existe la relación con relacion_empresa
    SELECT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_empresas_relacion' 
        AND table_name = 'empresas'
    ) INTO constraint_exists;
    
    IF NOT constraint_exists THEN
        ALTER TABLE empresas ADD CONSTRAINT fk_empresas_relacion 
        FOREIGN KEY (relacion) REFERENCES relacion_empresa(id);
        RAISE NOTICE 'Foreign key fk_empresas_relacion creada exitosamente';
    ELSE
        RAISE NOTICE 'Foreign key fk_empresas_relacion ya existe';
    END IF;
    
    -- Verificar si ya existe la relación con tamano_empresa
    SELECT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_empresas_tamano' 
        AND table_name = 'empresas'
    ) INTO constraint_exists;
    
    IF NOT constraint_exists THEN
        ALTER TABLE empresas ADD CONSTRAINT fk_empresas_tamano 
        FOREIGN KEY (tamaño) REFERENCES tamano_empresa(id);
        RAISE NOTICE 'Foreign key fk_empresas_tamano creada exitosamente';
    ELSE
        RAISE NOTICE 'Foreign key fk_empresas_tamano ya existe';
    END IF;
    
    -- Verificar si ya existe la relación con modalidades
    SELECT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_empresas_modalidad' 
        AND table_name = 'empresas'
    ) INTO constraint_exists;
    
    IF NOT constraint_exists THEN
        ALTER TABLE empresas ADD CONSTRAINT fk_empresas_modalidad 
        FOREIGN KEY (modalidad) REFERENCES modalidades(id);
        RAISE NOTICE 'Foreign key fk_empresas_modalidad creada exitosamente';
    ELSE
        RAISE NOTICE 'Foreign key fk_empresas_modalidad ya existe';
    END IF;
    
END $$;

-- ====================================
-- 2. CREAR ÍNDICES SI NO EXISTEN
-- ====================================

-- Índice para estado
CREATE INDEX IF NOT EXISTS idx_empresas_estado ON empresas(estado);

-- Índice para relacion
CREATE INDEX IF NOT EXISTS idx_empresas_relacion ON empresas(relacion);

-- Índice para tamaño
CREATE INDEX IF NOT EXISTS idx_empresas_tamano ON empresas(tamaño);

-- Índice para modalidad
CREATE INDEX IF NOT EXISTS idx_empresas_modalidad ON empresas(modalidad);

-- ====================================
-- 3. VERIFICAR RESULTADO FINAL
-- ====================================

-- Mostrar todas las foreign keys de la tabla empresas
SELECT 
    'RELACIONES CREADAS EN TABLA EMPRESAS' as titulo,
    '' as info
UNION ALL
SELECT 
    tc.constraint_name, 
    kcu.column_name || ' -> ' || ccu.table_name || '.' || ccu.column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'empresas'
ORDER BY tc.constraint_name;

-- ====================================
-- 4. VERIFICAR INTEGRIDAD DE DATOS
-- ====================================

-- Verificar que no hay datos huérfanos
SELECT 
    'VERIFICACIÓN DE INTEGRIDAD DE DATOS' as titulo,
    '' as info
UNION ALL
SELECT 
    'Total empresas:',
    COUNT(*)::text
FROM empresas
UNION ALL
SELECT 
    'Empresas con estado válido:',
    COUNT(*)::text
FROM empresas e
JOIN estado_empresa ee ON e.estado = ee.id
UNION ALL
SELECT 
    'Empresas con relación válida:',
    COUNT(*)::text
FROM empresas e
JOIN relacion_empresa re ON e.relacion = re.id
UNION ALL
SELECT 
    'Empresas con tamaño válido:',
    COUNT(*)::text
FROM empresas e
JOIN tamano_empresa te ON e.tamaño = te.id
UNION ALL
SELECT 
    'Empresas con modalidad válida:',
    COUNT(*)::text
FROM empresas e
JOIN modalidades m ON e.modalidad = m.id; 