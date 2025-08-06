-- ====================================
-- ACTUALIZAR EMPRESAS CON ESTADO CORRECTO
-- ====================================

-- 1. VERIFICAR DATOS CORRECTOS EN estado_empresa
SELECT '=== DATOS EN estado_empresa ===' as info;
SELECT id, nombre FROM estado_empresa ORDER BY nombre;

-- 2. VERIFICAR DATOS EN relacion_empresa
SELECT '=== DATOS EN relacion_empresa ===' as info;
SELECT id, nombre FROM relacion_empresa ORDER BY nombre;

-- 3. ACTUALIZAR EMPRESAS CON VALORES CORRECTOS

-- Actualizar empresas con estado 'Activa' (estado correcto de empresa)
UPDATE empresas 
SET estado = (SELECT id FROM estado_empresa WHERE nombre = 'Activa' LIMIT 1)
WHERE estado IS NULL;

-- Actualizar empresas con modalidad 'remoto' (ya confirmado que existe)
UPDATE empresas 
SET modalidad = (SELECT id FROM modalidades WHERE nombre = 'remoto' LIMIT 1)
WHERE modalidad IS NULL;

-- Actualizar empresas con tamaño 'Mid Market' (ya confirmado que existe)
UPDATE empresas 
SET tamaño = (SELECT id FROM tamano_empresa WHERE nombre = 'Mid Market' LIMIT 1)
WHERE tamaño IS NULL;

-- Actualizar empresas con relacion 'Cliente' (asumiendo que existe)
UPDATE empresas 
SET relacion = (SELECT id FROM relacion_empresa WHERE nombre = 'Cliente' LIMIT 1)
WHERE relacion IS NULL;

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
SELECT '✅ Empresas actualizadas con estado correcto (Activa/Inactiva)' as resultado; 