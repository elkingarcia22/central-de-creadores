-- ====================================
-- ACTUALIZAR EMPRESAS CON DATOS EXISTENTES
-- ====================================

-- 1. VERIFICAR EMPRESAS ACTUALES
SELECT '=== EMPRESAS ACTUALES ===' as info;
SELECT COUNT(*) as total_empresas FROM empresas;

SELECT 
    e.nombre,
    e.estado,
    e.relacion,
    e.tamaño,
    e.modalidad
FROM empresas e
ORDER BY e.nombre;

-- 2. ACTUALIZAR EMPRESAS CON DATOS EXISTENTES

-- Actualizar empresas con estado 'Excelente' (el mejor disponible)
UPDATE empresas 
SET estado = (SELECT id FROM estado_empresa WHERE nombre = 'Excelente' LIMIT 1)
WHERE estado IS NULL;

-- Actualizar empresas con modalidad 'Remoto' (la más común)
UPDATE empresas 
SET modalidad = (SELECT id FROM modalidades WHERE nombre = 'remoto' LIMIT 1)
WHERE modalidad IS NULL;

-- Actualizar empresas con tamaño 'Mid Market' (el más común)
UPDATE empresas 
SET tamaño = (SELECT id FROM tamano_empresa WHERE nombre = 'Mid Market' LIMIT 1)
WHERE tamaño IS NULL;

-- 3. VERIFICAR SI EXISTE relacion_empresa Y POBLARLA SI ES NECESARIO
DO $$
BEGIN
    -- Verificar si la tabla relacion_empresa existe
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'relacion_empresa' 
        AND table_schema = 'public'
    ) THEN
        -- Verificar si tiene datos
        IF (SELECT COUNT(*) FROM relacion_empresa) = 0 THEN
            -- Poblar con datos básicos
            INSERT INTO relacion_empresa (nombre) VALUES
                ('Cliente'),
                ('Prospecto'),
                ('Lead'),
                ('Partner');
        END IF;
        
        -- Actualizar empresas con relacion 'Cliente'
        UPDATE empresas 
        SET relacion = (SELECT id FROM relacion_empresa WHERE nombre = 'Cliente' LIMIT 1)
        WHERE relacion IS NULL;
    END IF;
END $$;

-- 4. VERIFICAR EMPRESAS ACTUALIZADAS
SELECT '=== EMPRESAS ACTUALIZADAS ===' as info;

SELECT 
    e.nombre,
    e.descripcion,
    p.nombre as pais,
    i.nombre as industria,
    u.nombre as kam,
    pr.nombre as producto,
    ee.nombre as estado,
    re.nombre as relacion,
    te.nombre as tamaño,
    m.nombre as modalidad
FROM empresas e
LEFT JOIN paises p ON e.pais = p.id
LEFT JOIN industrias i ON e.industria = i.id
LEFT JOIN usuarios u ON e.kam_id = u.id
LEFT JOIN productos pr ON e.producto_id = pr.id
LEFT JOIN estado_empresa ee ON e.estado = ee.id
LEFT JOIN relacion_empresa re ON e.relacion = re.id
LEFT JOIN tamano_empresa te ON e.tamaño = te.id
LEFT JOIN modalidades m ON e.modalidad = m.id
ORDER BY e.nombre;

-- 5. VERIFICAR CAMPOS VACÍOS RESTANTES
SELECT '=== VERIFICAR CAMPOS VACÍOS ===' as info;

SELECT 
    COUNT(*) as total_empresas,
    COUNT(estado) as con_estado,
    COUNT(relacion) as con_relacion,
    COUNT(tamaño) as con_tamaño,
    COUNT(modalidad) as con_modalidad
FROM empresas;

-- 6. MENSAJE DE CONFIRMACIÓN
SELECT '✅ Empresas actualizadas con datos existentes' as resultado; 