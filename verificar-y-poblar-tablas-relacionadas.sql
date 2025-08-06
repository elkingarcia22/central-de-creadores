-- ====================================
-- VERIFICAR Y POBLAR TABLAS RELACIONADAS
-- ====================================

-- 1. VERIFICAR DATOS EN TABLAS RELACIONADAS
SELECT '=== VERIFICAR DATOS EN TABLAS RELACIONADAS ===' as info;

-- Verificar estado_empresa
SELECT 'Estado empresa:' as tabla;
SELECT COUNT(*) as total FROM estado_empresa;
SELECT id, nombre FROM estado_empresa ORDER BY nombre;

-- Verificar relacion_empresa
SELECT 'Relacion empresa:' as tabla;
SELECT COUNT(*) as total FROM relacion_empresa;
SELECT id, nombre FROM relacion_empresa ORDER BY nombre;

-- Verificar tamano_empresa
SELECT 'Tamano empresa:' as tabla;
SELECT COUNT(*) as total FROM tamano_empresa;
SELECT id, nombre FROM tamano_empresa ORDER BY nombre;

-- Verificar modalidades
SELECT 'Modalidades:' as tabla;
SELECT COUNT(*) as total FROM modalidades;
SELECT id, nombre FROM modalidades ORDER BY nombre;

-- 2. POBLAR TABLAS VACÍAS

-- Poblar estado_empresa si está vacía
INSERT INTO estado_empresa (nombre) VALUES
    ('Activa'),
    ('Inactiva'),
    ('Pendiente'),
    ('Suspendida')
ON CONFLICT (nombre) DO NOTHING;

-- Poblar relacion_empresa si está vacía
INSERT INTO relacion_empresa (nombre) VALUES
    ('Cliente'),
    ('Prospecto'),
    ('Lead'),
    ('Partner'),
    ('Proveedor')
ON CONFLICT (nombre) DO NOTHING;

-- Poblar tamano_empresa si está vacía
INSERT INTO tamano_empresa (nombre) VALUES
    ('Startup'),
    ('Pequeña'),
    ('Mediana'),
    ('Grande'),
    ('Enterprise')
ON CONFLICT (nombre) DO NOTHING;

-- Poblar modalidades si está vacía
INSERT INTO modalidades (nombre) VALUES
    ('Presencial'),
    ('Remoto'),
    ('Híbrido'),
    ('Asíncrono'),
    ('Grabado')
ON CONFLICT (nombre) DO NOTHING;

-- 3. VERIFICAR DATOS DESPUÉS DE POBLAR
SELECT '=== VERIFICAR DATOS DESPUÉS DE POBLAR ===' as info;

-- Verificar estado_empresa
SELECT 'Estado empresa después:' as tabla;
SELECT COUNT(*) as total FROM estado_empresa;
SELECT id, nombre FROM estado_empresa ORDER BY nombre;

-- Verificar relacion_empresa
SELECT 'Relacion empresa después:' as tabla;
SELECT COUNT(*) as total FROM relacion_empresa;
SELECT id, nombre FROM relacion_empresa ORDER BY nombre;

-- Verificar tamano_empresa
SELECT 'Tamano empresa después:' as tabla;
SELECT COUNT(*) as total FROM tamano_empresa;
SELECT id, nombre FROM tamano_empresa ORDER BY nombre;

-- Verificar modalidades
SELECT 'Modalidades después:' as tabla;
SELECT COUNT(*) as total FROM modalidades;
SELECT id, nombre FROM modalidades ORDER BY nombre;

-- 4. ACTUALIZAR EMPRESAS CON LOS DATOS CORRECTOS
SELECT '=== ACTUALIZAR EMPRESAS ===' as info;

-- Actualizar empresas con estado 'Activa'
UPDATE empresas 
SET estado = (SELECT id FROM estado_empresa WHERE nombre = 'Activa' LIMIT 1)
WHERE estado IS NULL;

-- Actualizar empresas con relacion 'Cliente' o 'Prospecto' alternadamente
UPDATE empresas 
SET relacion = (SELECT id FROM relacion_empresa WHERE nombre = 'Cliente' LIMIT 1)
WHERE relacion IS NULL AND id IN (
    SELECT id FROM empresas ORDER BY nombre LIMIT 3
);

UPDATE empresas 
SET relacion = (SELECT id FROM relacion_empresa WHERE nombre = 'Prospecto' LIMIT 1)
WHERE relacion IS NULL;

-- Actualizar empresas con tamaños alternados
UPDATE empresas 
SET tamaño = (SELECT id FROM tamano_empresa WHERE nombre = 'Mediana' LIMIT 1)
WHERE tamaño IS NULL AND id IN (
    SELECT id FROM empresas ORDER BY nombre LIMIT 2
);

UPDATE empresas 
SET tamaño = (SELECT id FROM tamano_empresa WHERE nombre = 'Grande' LIMIT 1)
WHERE tamaño IS NULL AND id IN (
    SELECT id FROM empresas ORDER BY nombre LIMIT 1 OFFSET 2
);

UPDATE empresas 
SET tamaño = (SELECT id FROM tamano_empresa WHERE nombre = 'Pequeña' LIMIT 1)
WHERE tamaño IS NULL AND id IN (
    SELECT id FROM empresas ORDER BY nombre LIMIT 1 OFFSET 3
);

UPDATE empresas 
SET tamaño = (SELECT id FROM tamano_empresa WHERE nombre = 'Enterprise' LIMIT 1)
WHERE tamaño IS NULL;

-- Actualizar empresas con modalidades alternadas
UPDATE empresas 
SET modalidad = (SELECT id FROM modalidades WHERE nombre = 'Remoto' LIMIT 1)
WHERE modalidad IS NULL AND id IN (
    SELECT id FROM empresas ORDER BY nombre LIMIT 2
);

UPDATE empresas 
SET modalidad = (SELECT id FROM modalidades WHERE nombre = 'Híbrido' LIMIT 1)
WHERE modalidad IS NULL AND id IN (
    SELECT id FROM empresas ORDER BY nombre LIMIT 2 OFFSET 2
);

UPDATE empresas 
SET modalidad = (SELECT id FROM modalidades WHERE nombre = 'Presencial' LIMIT 1)
WHERE modalidad IS NULL;

-- 5. VERIFICAR EMPRESAS ACTUALIZADAS
SELECT '=== VERIFICAR EMPRESAS ACTUALIZADAS ===' as info;

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

-- 6. MENSAJE DE CONFIRMACIÓN
SELECT '✅ Tablas relacionadas pobladas y empresas actualizadas exitosamente' as resultado; 