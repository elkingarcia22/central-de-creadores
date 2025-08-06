-- ====================================
-- INSERTAR EMPRESAS SIMPLE
-- ====================================

-- 1. LIMPIAR TABLA
SELECT '=== LIMPIANDO TABLA ===' as info;
DELETE FROM empresas;

-- 2. VERIFICAR CATÁLOGOS MÍNIMOS
SELECT '=== VERIFICAR CATÁLOGOS MÍNIMOS ===' as info;
SELECT 
    'paises' as tabla,
    COUNT(*) as total,
    CASE WHEN COUNT(*) > 0 THEN 'OK' ELSE 'VACÍO' END as estado
FROM paises
UNION ALL
SELECT 
    'industrias' as tabla,
    COUNT(*) as total,
    CASE WHEN COUNT(*) > 0 THEN 'OK' ELSE 'VACÍO' END as estado
FROM industrias
UNION ALL
SELECT 
    'usuarios' as tabla,
    COUNT(*) as total,
    CASE WHEN COUNT(*) > 0 THEN 'OK' ELSE 'VACÍO' END as estado
FROM usuarios;

-- 3. INSERTAR EMPRESAS SIMPLES
SELECT '=== INSERTANDO EMPRESAS SIMPLES ===' as info;

-- Empresa 1
INSERT INTO empresas (nombre, pais, industria, kam_id) VALUES (
    'TechCorp Solutions',
    (SELECT id FROM paises LIMIT 1),
    (SELECT id FROM industrias LIMIT 1),
    (SELECT id FROM usuarios LIMIT 1)
);

-- Empresa 2
INSERT INTO empresas (nombre, pais, industria, kam_id) VALUES (
    'FinanceHub International',
    (SELECT id FROM paises LIMIT 1),
    (SELECT id FROM industrias LIMIT 1),
    (SELECT id FROM usuarios LIMIT 1)
);

-- Empresa 3
INSERT INTO empresas (nombre, pais, industria, kam_id) VALUES (
    'HealthTech Innovations',
    (SELECT id FROM paises LIMIT 1),
    (SELECT id FROM industrias LIMIT 1),
    (SELECT id FROM usuarios LIMIT 1)
);

-- Empresa 4
INSERT INTO empresas (nombre, pais, industria, kam_id) VALUES (
    'EduTech Pro',
    (SELECT id FROM paises LIMIT 1),
    (SELECT id FROM industrias LIMIT 1),
    (SELECT id FROM usuarios LIMIT 1)
);

-- Empresa 5
INSERT INTO empresas (nombre, pais, industria, kam_id) VALUES (
    'GreenEnergy Corp',
    (SELECT id FROM paises LIMIT 1),
    (SELECT id FROM industrias LIMIT 1),
    (SELECT id FROM usuarios LIMIT 1)
);

-- 4. VERIFICAR INSERCIÓN
SELECT '=== VERIFICAR INSERCIÓN ===' as info;
SELECT COUNT(*) as total_empresas FROM empresas;

SELECT '=== EMPRESAS INSERTADAS ===' as info;
SELECT 
    id,
    nombre,
    pais,
    industria,
    kam_id
FROM empresas 
ORDER BY nombre;

-- 5. VERIFICAR QUE SE PUEDEN LEER
SELECT '=== VERIFICAR LECTURA ===' as info;
SELECT 
    e.nombre as empresa,
    p.nombre as pais,
    i.nombre as industria,
    u.nombre as kam
FROM empresas e
LEFT JOIN paises p ON e.pais = p.id
LEFT JOIN industrias i ON e.industria = i.id
LEFT JOIN usuarios u ON e.kam_id = u.id
ORDER BY e.nombre;

-- 6. MENSAJE FINAL
SELECT '✅ Empresas insertadas exitosamente' as resultado; 