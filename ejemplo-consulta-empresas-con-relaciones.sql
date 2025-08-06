-- ====================================
-- EJEMPLOS DE CONSULTAS CON RELACIONES EN TABLA EMPRESAS
-- ====================================

-- ====================================
-- 1. CONSULTA BÁSICA CON TODAS LAS RELACIONES
-- ====================================

SELECT 
    e.id,
    e.nombre,
    e.descripcion,
    -- Información de país
    p.nombre as pais_nombre,
    -- Información de industria
    i.nombre as industria_nombre,
    -- Información de estado
    ee.nombre as estado_nombre,
    -- Información de relación
    re.nombre as relacion_nombre,
    -- Información de tamaño
    te.nombre as tamano_nombre,
    -- Información de modalidad
    m.nombre as modalidad_nombre,
    -- Información de KAM
    u.nombre as kam_nombre,
    u.correo as kam_email
FROM empresas e
LEFT JOIN paises p ON e.pais = p.id
LEFT JOIN industrias i ON e.industria = i.id
LEFT JOIN estado_empresa ee ON e.estado = ee.id
LEFT JOIN relacion_empresa re ON e.relacion = re.id
LEFT JOIN tamano_empresa te ON e.tamaño = te.id
LEFT JOIN modalidades m ON e.modalidad = m.id
LEFT JOIN usuarios u ON e.kam_id = u.id
ORDER BY e.nombre;

-- ====================================
-- 2. CONSULTA PARA FILTRAR POR ESTADO
-- ====================================

SELECT 
    e.nombre,
    ee.nombre as estado
FROM empresas e
JOIN estado_empresa ee ON e.estado = ee.id
WHERE ee.nombre = 'activa'
ORDER BY e.nombre;

-- ====================================
-- 3. CONSULTA PARA FILTRAR POR TAMAÑO
-- ====================================

SELECT 
    e.nombre,
    te.nombre as tamano
FROM empresas e
JOIN tamano_empresa te ON e.tamaño = te.id
WHERE te.nombre = 'Enterprise'
ORDER BY e.nombre;

-- ====================================
-- 4. CONSULTA PARA FILTRAR POR RELACIÓN
-- ====================================

SELECT 
    e.nombre,
    re.nombre as relacion
FROM empresas e
JOIN relacion_empresa re ON e.relacion = re.id
WHERE re.nombre IN ('Excelente', 'Buena')
ORDER BY re.nombre, e.nombre;

-- ====================================
-- 5. CONSULTA PARA FILTRAR POR MODALIDAD
-- ====================================

SELECT 
    e.nombre,
    m.nombre as modalidad
FROM empresas e
JOIN modalidades m ON e.modalidad = m.id
WHERE m.nombre = 'presencial'
ORDER BY e.nombre;

-- ====================================
-- 6. CONSULTA PARA ESTADÍSTICAS
-- ====================================

SELECT 
    'ESTADÍSTICAS POR ESTADO' as categoria,
    ee.nombre as valor,
    COUNT(*) as cantidad
FROM empresas e
JOIN estado_empresa ee ON e.estado = ee.id
GROUP BY ee.nombre
UNION ALL
SELECT 
    'ESTADÍSTICAS POR TAMAÑO' as categoria,
    te.nombre as valor,
    COUNT(*) as cantidad
FROM empresas e
JOIN tamano_empresa te ON e.tamaño = te.id
GROUP BY te.nombre
UNION ALL
SELECT 
    'ESTADÍSTICAS POR RELACIÓN' as categoria,
    re.nombre as valor,
    COUNT(*) as cantidad
FROM empresas e
JOIN relacion_empresa re ON e.relacion = re.id
GROUP BY re.nombre
UNION ALL
SELECT 
    'ESTADÍSTICAS POR MODALIDAD' as categoria,
    m.nombre as valor,
    COUNT(*) as cantidad
FROM empresas e
JOIN modalidades m ON e.modalidad = m.id
GROUP BY m.nombre
ORDER BY categoria, cantidad DESC;

-- ====================================
-- 7. CONSULTA PARA INSERTAR NUEVA EMPRESA
-- ====================================

-- Ejemplo de cómo insertar una nueva empresa con todas las relaciones
-- (Reemplazar los IDs con valores reales de los catálogos)

/*
INSERT INTO empresas (
    nombre,
    descripcion,
    pais,
    industria,
    estado,
    relacion,
    tamaño,
    modalidad,
    kam_id
) VALUES (
    'Nueva Empresa Ejemplo',
    'Descripción de la nueva empresa',
    '0ee98b63-c1dd-435e-8f95-7227ed0547cd', -- ID de Uruguay
    '1bb43a45-0df4-461f-b2f3-eced558ecf54', -- ID de Agroindustry
    '57c79982-e984-4c66-aefa-f12de72aafdc', -- ID de activa
    'ccd87e4a-ecd8-4487-ae71-06eaf5e1d751', -- ID de Excelente
    '8fb1db95-5fa7-4074-89da-ec0e7c43581a', -- ID de Enterprise
    '0738bd51-2cd7-4446-a8a1-c1cbcb66fc6c', -- ID de presencial
    '0332e905-06e1-4e5d-bf81-7e4b9e8a41d6'  -- ID del KAM
);
*/

-- ====================================
-- 8. CONSULTA PARA OBTENER CATÁLOGOS
-- ====================================

-- Obtener todos los estados disponibles
SELECT 'estados' as catalogo, id, nombre FROM estado_empresa ORDER BY nombre;

-- Obtener todas las relaciones disponibles
SELECT 'relaciones' as catalogo, id, nombre FROM relacion_empresa ORDER BY nombre;

-- Obtener todos los tamaños disponibles
SELECT 'tamanos' as catalogo, id, nombre FROM tamano_empresa ORDER BY nombre;

-- Obtener todas las modalidades disponibles
SELECT 'modalidades' as catalogo, id, nombre FROM modalidades ORDER BY nombre;

-- ====================================
-- 9. CONSULTA PARA ACTUALIZAR EMPRESA
-- ====================================

-- Ejemplo de cómo actualizar una empresa con nuevas relaciones
-- (Reemplazar los IDs con valores reales)

/*
UPDATE empresas 
SET 
    estado = '57c79982-e984-4c66-aefa-f12de72aafdc', -- activa
    relacion = 'ccd87e4a-ecd8-4487-ae71-06eaf5e1d751', -- Excelente
    tamaño = '8fb1db95-5fa7-4074-89da-ec0e7c43581a', -- Enterprise
    modalidad = '0738bd51-2cd7-4446-a8a1-c1cbcb66fc6c' -- presencial
WHERE id = 'ID_DE_LA_EMPRESA';
*/ 