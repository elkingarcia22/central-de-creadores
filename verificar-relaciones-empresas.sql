-- ====================================
-- SCRIPT PARA VERIFICAR RELACIONES EN TABLA EMPRESAS
-- ====================================

-- ====================================
-- 1. VERIFICAR ESTRUCTURA DE LA TABLA
-- ====================================

SELECT 
    'ESTRUCTURA DE TABLA EMPRESAS' as titulo,
    '' as info
UNION ALL
SELECT 
    column_name, 
    data_type || ' - ' || 
    CASE WHEN is_nullable = 'YES' THEN 'NULL' ELSE 'NOT NULL' END
FROM information_schema.columns 
WHERE table_name = 'empresas' 
ORDER BY ordinal_position;

-- ====================================
-- 2. VERIFICAR FOREIGN KEYS EXISTENTES
-- ====================================

SELECT 
    'FOREIGN KEYS EN TABLA EMPRESAS' as titulo,
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
-- 3. VERIFICAR DATOS CON RELACIONES
-- ====================================

SELECT 
    'DATOS DE EMPRESAS CON RELACIONES' as titulo,
    '' as info
UNION ALL
SELECT 
    e.nombre,
    'Estado: ' || COALESCE(ee.nombre, 'Sin estado') || 
    ' | Relación: ' || COALESCE(re.nombre, 'Sin relación') ||
    ' | Tamaño: ' || COALESCE(te.nombre, 'Sin tamaño') ||
    ' | Modalidad: ' || COALESCE(m.nombre, 'Sin modalidad')
FROM empresas e
LEFT JOIN estado_empresa ee ON e.estado = ee.id
LEFT JOIN relacion_empresa re ON e.relacion = re.id
LEFT JOIN tamano_empresa te ON e.tamaño = te.id
LEFT JOIN modalidades m ON e.modalidad = m.id
ORDER BY e.nombre;

-- ====================================
-- 4. VERIFICAR INTEGRIDAD REFERENCIAL
-- ====================================

SELECT 
    'VERIFICACIÓN DE INTEGRIDAD REFERENCIAL' as titulo,
    '' as info
UNION ALL
SELECT 
    'Empresas con estado inválido:',
    COUNT(*)::text
FROM empresas e
LEFT JOIN estado_empresa ee ON e.estado = ee.id
WHERE e.estado IS NOT NULL AND ee.id IS NULL
UNION ALL
SELECT 
    'Empresas con relación inválida:',
    COUNT(*)::text
FROM empresas e
LEFT JOIN relacion_empresa re ON e.relacion = re.id
WHERE e.relacion IS NOT NULL AND re.id IS NULL
UNION ALL
SELECT 
    'Empresas con tamaño inválido:',
    COUNT(*)::text
FROM empresas e
LEFT JOIN tamano_empresa te ON e.tamaño = te.id
WHERE e.tamaño IS NOT NULL AND te.id IS NULL
UNION ALL
SELECT 
    'Empresas con modalidad inválida:',
    COUNT(*)::text
FROM empresas e
LEFT JOIN modalidades m ON e.modalidad = m.id
WHERE e.modalidad IS NOT NULL AND m.id IS NULL;

-- ====================================
-- 5. VERIFICAR ÍNDICES
-- ====================================

SELECT 
    'ÍNDICES EN TABLA EMPRESAS' as titulo,
    '' as info
UNION ALL
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'empresas'
ORDER BY indexname;

-- ====================================
-- 6. EJEMPLO DE CONSULTA CON JOINS
-- ====================================

SELECT 
    'EJEMPLO DE CONSULTA COMPLETA' as titulo,
    '' as info
UNION ALL
SELECT 
    e.nombre as empresa,
    'País: ' || COALESCE(p.nombre, 'Sin país') ||
    ' | Industria: ' || COALESCE(i.nombre, 'Sin industria') ||
    ' | Estado: ' || COALESCE(ee.nombre, 'Sin estado') ||
    ' | Relación: ' || COALESCE(re.nombre, 'Sin relación') ||
    ' | Tamaño: ' || COALESCE(te.nombre, 'Sin tamaño') ||
    ' | Modalidad: ' || COALESCE(m.nombre, 'Sin modalidad')
FROM empresas e
LEFT JOIN paises p ON e.pais = p.id
LEFT JOIN industrias i ON e.industria = i.id
LEFT JOIN estado_empresa ee ON e.estado = ee.id
LEFT JOIN relacion_empresa re ON e.relacion = re.id
LEFT JOIN tamano_empresa te ON e.tamaño = te.id
LEFT JOIN modalidades m ON e.modalidad = m.id
ORDER BY e.nombre
LIMIT 3; 