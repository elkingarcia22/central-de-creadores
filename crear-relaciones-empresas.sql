-- ====================================
-- SCRIPT PARA CREAR RELACIONES EN TABLA EMPRESAS
-- ====================================

-- Verificar estructura actual de la tabla empresas
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'empresas' 
ORDER BY ordinal_position;

-- ====================================
-- 1. AGREGAR FOREIGN KEY PARA ESTADO
-- ====================================

-- Verificar que la columna estado existe
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'empresas' AND column_name = 'estado';

-- Agregar foreign key constraint para estado
ALTER TABLE empresas 
ADD CONSTRAINT fk_empresas_estado 
FOREIGN KEY (estado) REFERENCES estado_empresa(id);

-- ====================================
-- 2. AGREGAR FOREIGN KEY PARA RELACIÓN
-- ====================================

-- Verificar que la columna relacion existe
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'empresas' AND column_name = 'relacion';

-- Agregar foreign key constraint para relacion
ALTER TABLE empresas 
ADD CONSTRAINT fk_empresas_relacion 
FOREIGN KEY (relacion) REFERENCES relacion_empresa(id);

-- ====================================
-- 3. AGREGAR FOREIGN KEY PARA TAMAÑO
-- ====================================

-- Verificar que la columna tamaño existe
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'empresas' AND column_name = 'tamaño';

-- Agregar foreign key constraint para tamaño
ALTER TABLE empresas 
ADD CONSTRAINT fk_empresas_tamano 
FOREIGN KEY (tamaño) REFERENCES tamano_empresa(id);

-- ====================================
-- 4. AGREGAR FOREIGN KEY PARA MODALIDAD
-- ====================================

-- Verificar que la columna modalidad existe
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'empresas' AND column_name = 'modalidad';

-- Agregar foreign key constraint para modalidad
ALTER TABLE empresas 
ADD CONSTRAINT fk_empresas_modalidad 
FOREIGN KEY (modalidad) REFERENCES modalidades(id);

-- ====================================
-- 5. VERIFICAR RELACIONES EXISTENTES
-- ====================================

-- Verificar que la relación con industria ya existe
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
    AND tc.table_name = 'empresas'
ORDER BY tc.constraint_name;

-- ====================================
-- 6. VERIFICAR DATOS ACTUALES
-- ====================================

-- Verificar que los datos actuales son válidos para las nuevas relaciones
SELECT 
    e.id,
    e.nombre,
    e.estado,
    ee.nombre as estado_nombre,
    e.relacion,
    re.nombre as relacion_nombre,
    e.tamaño,
    te.nombre as tamano_nombre,
    e.modalidad,
    m.nombre as modalidad_nombre
FROM empresas e
LEFT JOIN estado_empresa ee ON e.estado = ee.id
LEFT JOIN relacion_empresa re ON e.relacion = re.id
LEFT JOIN tamano_empresa te ON e.tamaño = te.id
LEFT JOIN modalidades m ON e.modalidad = m.id
LIMIT 5;

-- ====================================
-- 7. CREAR ÍNDICES PARA OPTIMIZACIÓN
-- ====================================

-- Crear índices para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_empresas_estado ON empresas(estado);
CREATE INDEX IF NOT EXISTS idx_empresas_relacion ON empresas(relacion);
CREATE INDEX IF NOT EXISTS idx_empresas_tamano ON empresas(tamaño);
CREATE INDEX IF NOT EXISTS idx_empresas_modalidad ON empresas(modalidad);

-- ====================================
-- 8. VERIFICAR ESTRUCTURA FINAL
-- ====================================

-- Mostrar todas las relaciones de la tabla empresas
SELECT 
    'empresas' as tabla,
    'industria' as columna,
    'industrias' as tabla_referenciada,
    'id' as columna_referenciada
UNION ALL
SELECT 
    'empresas' as tabla,
    'pais' as columna,
    'paises' as tabla_referenciada,
    'id' as columna_referenciada
UNION ALL
SELECT 
    'empresas' as tabla,
    'estado' as columna,
    'estado_empresa' as tabla_referenciada,
    'id' as columna_referenciada
UNION ALL
SELECT 
    'empresas' as tabla,
    'relacion' as columna,
    'relacion_empresa' as tabla_referenciada,
    'id' as columna_referenciada
UNION ALL
SELECT 
    'empresas' as tabla,
    'tamaño' as columna,
    'tamano_empresa' as tabla_referenciada,
    'id' as columna_referenciada
UNION ALL
SELECT 
    'empresas' as tabla,
    'modalidad' as columna,
    'modalidades' as tabla_referenciada,
    'id' as columna_referenciada
ORDER BY columna; 