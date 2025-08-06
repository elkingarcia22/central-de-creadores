-- ====================================
-- POBLAR EMPRESAS CON DATOS REALES
-- ====================================

-- 1. LIMPIAR TABLA EMPRESAS
SELECT '=== LIMPIANDO TABLA ===' as info;
DELETE FROM empresas;

-- 2. VERIFICAR CATÁLOGOS DISPONIBLES
SELECT '=== VERIFICAR CATÁLOGOS ===' as info;
SELECT 
    'paises' as tabla,
    COUNT(*) as total,
    STRING_AGG(nombre, ', ') as nombres
FROM paises
UNION ALL
SELECT 
    'industrias' as tabla,
    COUNT(*) as total,
    STRING_AGG(nombre, ', ') as nombres
FROM industrias
UNION ALL
SELECT 
    'usuarios' as tabla,
    COUNT(*) as total,
    STRING_AGG(nombre, ', ') as nombres
FROM usuarios
UNION ALL
SELECT 
    'estado_empresa' as tabla,
    COUNT(*) as total,
    STRING_AGG(nombre, ', ') as nombres
FROM estado_empresa
UNION ALL
SELECT 
    'relacion_empresa' as tabla,
    COUNT(*) as total,
    STRING_AGG(nombre, ', ') as nombres
FROM relacion_empresa
UNION ALL
SELECT 
    'tamano_empresa' as tabla,
    COUNT(*) as total,
    STRING_AGG(nombre, ', ') as nombres
FROM tamano_empresa
UNION ALL
SELECT 
    'modalidades' as tabla,
    COUNT(*) as total,
    STRING_AGG(nombre, ', ') as nombres
FROM modalidades;

-- 3. POBLAR EMPRESAS
SELECT '=== POBLANDO EMPRESAS ===' as info;

INSERT INTO empresas (nombre, pais, industria, kam_id, descripcion, estado, relacion, tamaño, modalidad) 
SELECT 
    'TechCorp Solutions',
    (SELECT id FROM paises LIMIT 1),
    (SELECT id FROM industrias LIMIT 1),
    (SELECT id FROM usuarios LIMIT 1),
    'Empresa de tecnología líder en innovación y desarrollo de software',
    (SELECT id FROM estado_empresa WHERE nombre = 'activa' LIMIT 1),
    (SELECT id FROM relacion_empresa LIMIT 1),
    (SELECT id FROM tamano_empresa WHERE nombre = 'Mid Market' LIMIT 1),
    (SELECT id FROM modalidades WHERE nombre = 'remoto' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM empresas WHERE nombre = 'TechCorp Solutions');

INSERT INTO empresas (nombre, pais, industria, kam_id, descripcion, estado, relacion, tamaño, modalidad) 
SELECT 
    'FinanceHub International',
    (SELECT id FROM paises LIMIT 1),
    (SELECT id FROM industrias LIMIT 1),
    (SELECT id FROM usuarios LIMIT 1),
    'Empresa financiera con presencia global y servicios bancarios innovadores',
    (SELECT id FROM estado_empresa WHERE nombre = 'activa' LIMIT 1),
    (SELECT id FROM relacion_empresa LIMIT 1),
    (SELECT id FROM tamano_empresa WHERE nombre = 'Enterprise' LIMIT 1),
    (SELECT id FROM modalidades WHERE nombre = 'hibrido' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM empresas WHERE nombre = 'FinanceHub International');

INSERT INTO empresas (nombre, pais, industria, kam_id, descripcion, estado, relacion, tamaño, modalidad) 
SELECT 
    'HealthTech Innovations',
    (SELECT id FROM paises LIMIT 1),
    (SELECT id FROM industrias LIMIT 1),
    (SELECT id FROM usuarios LIMIT 1),
    'Empresa de salud y tecnología especializada en telemedicina',
    (SELECT id FROM estado_empresa WHERE nombre = 'activa' LIMIT 1),
    (SELECT id FROM relacion_empresa LIMIT 1),
    (SELECT id FROM tamano_empresa WHERE nombre = 'SMB' LIMIT 1),
    (SELECT id FROM modalidades WHERE nombre = 'presencial' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM empresas WHERE nombre = 'HealthTech Innovations');

INSERT INTO empresas (nombre, pais, industria, kam_id, descripcion, estado, relacion, tamaño, modalidad) 
SELECT 
    'EduTech Pro',
    (SELECT id FROM paises LIMIT 1),
    (SELECT id FROM industrias LIMIT 1),
    (SELECT id FROM usuarios LIMIT 1),
    'Empresa de educación tecnológica con plataformas de aprendizaje online',
    (SELECT id FROM estado_empresa WHERE nombre = 'activa' LIMIT 1),
    (SELECT id FROM relacion_empresa LIMIT 1),
    (SELECT id FROM tamano_empresa WHERE nombre = 'Mid Market' LIMIT 1),
    (SELECT id FROM modalidades WHERE nombre = 'remoto' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM empresas WHERE nombre = 'EduTech Pro');

INSERT INTO empresas (nombre, pais, industria, kam_id, descripcion, estado, relacion, tamaño, modalidad) 
SELECT 
    'GreenEnergy Corp',
    (SELECT id FROM paises LIMIT 1),
    (SELECT id FROM industrias LIMIT 1),
    (SELECT id FROM usuarios LIMIT 1),
    'Empresa de energía renovable y soluciones sostenibles',
    (SELECT id FROM estado_empresa WHERE nombre = 'activa' LIMIT 1),
    (SELECT id FROM relacion_empresa LIMIT 1),
    (SELECT id FROM tamano_empresa WHERE nombre = 'Enterprise' LIMIT 1),
    (SELECT id FROM modalidades WHERE nombre = 'hibrido' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM empresas WHERE nombre = 'GreenEnergy Corp');

-- 4. VERIFICAR RESULTADO
SELECT '=== VERIFICAR RESULTADO ===' as info;
SELECT COUNT(*) as total_empresas FROM empresas;

SELECT '=== EMPRESAS CREADAS ===' as info;
SELECT 
    e.nombre,
    p.nombre as pais,
    i.nombre as industria,
    u.nombre as kam,
    ee.nombre as estado,
    re.nombre as relacion,
    te.nombre as tamaño,
    m.nombre as modalidad
FROM empresas e
LEFT JOIN paises p ON e.pais = p.id
LEFT JOIN industrias i ON e.industria = i.id
LEFT JOIN usuarios u ON e.kam_id = u.id
LEFT JOIN estado_empresa ee ON e.estado = ee.id
LEFT JOIN relacion_empresa re ON e.relacion = re.id
LEFT JOIN tamano_empresa te ON e.tamaño = te.id
LEFT JOIN modalidades m ON e.modalidad = m.id
ORDER BY e.nombre;

-- 5. MENSAJE FINAL
SELECT '✅ Empresas pobladas exitosamente' as resultado; 