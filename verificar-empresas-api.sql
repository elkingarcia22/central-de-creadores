-- ====================================
-- VERIFICAR EMPRESAS PARA LA API
-- ====================================

-- 1. VERIFICAR EMPRESAS DISPONIBLES
SELECT '=== EMPRESAS DISPONIBLES ===' as info;
SELECT 
    id,
    nombre,
    pais,
    industria,
    kam_id,
    estado,
    relacion,
    tamaño,
    modalidad
FROM empresas 
ORDER BY nombre;

-- 2. VERIFICAR EMPRESAS CON RELACIONES COMPLETAS
SELECT '=== EMPRESAS CON RELACIONES ===' as info;
SELECT 
    e.nombre as empresa,
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

-- 3. VERIFICAR CAMPOS OBLIGATORIOS
SELECT '=== VERIFICAR CAMPOS OBLIGATORIOS ===' as info;
SELECT 
    COUNT(*) as total_empresas,
    COUNT(nombre) as con_nombre,
    COUNT(pais) as con_pais,
    COUNT(industria) as con_industria,
    COUNT(kam_id) as con_kam
FROM empresas;

-- 4. VERIFICAR CAMPOS OPCIONALES
SELECT '=== VERIFICAR CAMPOS OPCIONALES ===' as info;
SELECT 
    COUNT(*) as total_empresas,
    COUNT(estado) as con_estado,
    COUNT(relacion) as con_relacion,
    COUNT(tamaño) as con_tamaño,
    COUNT(modalidad) as con_modalidad
FROM empresas;

-- 5. MENSAJE DE CONFIRMACIÓN
SELECT '✅ Verificación de empresas completada' as resultado; 