-- ====================================
-- POBLAR TABLA EMPRESAS CON DATOS DE EJEMPLO
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- 1. VERIFICAR DATOS DISPONIBLES EN TABLAS RELACIONADAS
SELECT '=== VERIFICAR DATOS DISPONIBLES ===' as info;

-- Verificar países
SELECT 'Países disponibles:' as info;
SELECT COUNT(*) as total_paises FROM paises;
SELECT id, nombre FROM paises ORDER BY nombre LIMIT 5;

-- Verificar industrias
SELECT 'Industrias disponibles:' as info;
SELECT COUNT(*) as total_industrias FROM industrias;
SELECT id, nombre FROM industrias ORDER BY nombre LIMIT 5;

-- Verificar usuarios (para KAM)
SELECT 'Usuarios disponibles para KAM:' as info;
SELECT COUNT(*) as total_usuarios FROM usuarios;
SELECT id, nombre, correo FROM usuarios ORDER BY nombre LIMIT 5;

-- Verificar productos
SELECT 'Productos disponibles:' as info;
SELECT COUNT(*) as total_productos FROM productos;
SELECT id, nombre FROM productos ORDER BY nombre LIMIT 5;

-- Verificar estado_empresa
SELECT 'Estados de empresa disponibles:' as info;
SELECT COUNT(*) as total_estados FROM estado_empresa;
SELECT id, nombre FROM estado_empresa ORDER BY nombre LIMIT 5;

-- Verificar relacion_empresa
SELECT 'Relaciones de empresa disponibles:' as info;
SELECT COUNT(*) as total_relaciones FROM relacion_empresa;
SELECT id, nombre FROM relacion_empresa ORDER BY nombre LIMIT 5;

-- Verificar tamano_empresa
SELECT 'Tamaños de empresa disponibles:' as info;
SELECT COUNT(*) as total_tamanos FROM tamano_empresa;
SELECT id, nombre FROM tamano_empresa ORDER BY nombre LIMIT 5;

-- Verificar modalidades
SELECT 'Modalidades disponibles:' as info;
SELECT COUNT(*) as total_modalidades FROM modalidades;
SELECT id, nombre FROM modalidades ORDER BY nombre LIMIT 5;

-- 2. POBLAR TABLA EMPRESAS CON DATOS DE EJEMPLO
SELECT '=== POBLANDO TABLA EMPRESAS ===' as info;
SELECT COUNT(*) as empresas_existentes FROM empresas;

-- Insertar empresas de ejemplo con relaciones reales
INSERT INTO empresas (
    nombre,
    descripcion,
    pais,
    industria,
    kam_id,
    producto_id,
    estado,
    relacion,
    tamaño,
    modalidad
) 
SELECT 
    e.nombre,
    e.descripcion,
    e.pais_id,
    e.industria_id,
    e.kam_id,
    e.producto_id,
    e.estado_id,
    e.relacion_id,
    e.tamaño_id,
    e.modalidad_id
FROM (
    VALUES 
    -- Empresa 1: TechCorp Solutions
    (
        'TechCorp Solutions',
        'Empresa líder en desarrollo de software y soluciones tecnológicas para el sector financiero. Especializada en aplicaciones móviles y sistemas de pago digital.',
        (SELECT id FROM paises WHERE nombre = 'Colombia' LIMIT 1),
        (SELECT id FROM industrias WHERE nombre = 'Technology' LIMIT 1),
        (SELECT id FROM usuarios ORDER BY nombre LIMIT 1),
        (SELECT id FROM productos ORDER BY nombre LIMIT 1),
        (SELECT id FROM estado_empresa WHERE nombre = 'Activa' LIMIT 1),
        (SELECT id FROM relacion_empresa WHERE nombre = 'Cliente' LIMIT 1),
        (SELECT id FROM tamano_empresa WHERE nombre = 'Mediana' LIMIT 1),
        (SELECT id FROM modalidades WHERE nombre = 'Remoto' LIMIT 1)
    ),
    -- Empresa 2: FinanceHub International
    (
        'FinanceHub International',
        'Plataforma financiera innovadora para servicios bancarios digitales. Enfocada en la transformación digital del sector bancario latinoamericano.',
        (SELECT id FROM paises WHERE nombre = 'México' LIMIT 1),
        (SELECT id FROM industrias WHERE nombre = 'Financial Services & Insurance' LIMIT 1),
        (SELECT id FROM usuarios ORDER BY nombre LIMIT 1 OFFSET 1),
        (SELECT id FROM productos ORDER BY nombre LIMIT 1 OFFSET 1),
        (SELECT id FROM estado_empresa WHERE nombre = 'Activa' LIMIT 1),
        (SELECT id FROM relacion_empresa WHERE nombre = 'Prospecto' LIMIT 1),
        (SELECT id FROM tamano_empresa WHERE nombre = 'Grande' LIMIT 1),
        (SELECT id FROM modalidades WHERE nombre = 'Híbrido' LIMIT 1)
    ),
    -- Empresa 3: HealthTech Innovations
    (
        'HealthTech Innovations',
        'Desarrollo de aplicaciones móviles para el sector de la salud. Especializada en telemedicina y gestión de historias clínicas digitales.',
        (SELECT id FROM paises WHERE nombre = 'Argentina' LIMIT 1),
        (SELECT id FROM industrias WHERE nombre = 'Pharma & Healthcare' LIMIT 1),
        (SELECT id FROM usuarios ORDER BY nombre LIMIT 1 OFFSET 2),
        (SELECT id FROM productos ORDER BY nombre LIMIT 1 OFFSET 2),
        (SELECT id FROM estado_empresa WHERE nombre = 'Activa' LIMIT 1),
        (SELECT id FROM relacion_empresa WHERE nombre = 'Cliente' LIMIT 1),
        (SELECT id FROM tamano_empresa WHERE nombre = 'Pequeña' LIMIT 1),
        (SELECT id FROM modalidades WHERE nombre = 'Presencial' LIMIT 1)
    ),
    -- Empresa 4: GovDigital
    (
        'GovDigital',
        'Digitalización de servicios gubernamentales. Transformación digital de procesos públicos y mejora de la experiencia ciudadana.',
        (SELECT id FROM paises WHERE nombre = 'Chile' LIMIT 1),
        (SELECT id FROM industrias WHERE nombre = 'Government' LIMIT 1),
        (SELECT id FROM usuarios ORDER BY nombre LIMIT 1 OFFSET 3),
        (SELECT id FROM productos ORDER BY nombre LIMIT 1),
        (SELECT id FROM estado_empresa WHERE nombre = 'Activa' LIMIT 1),
        (SELECT id FROM relacion_empresa WHERE nombre = 'Cliente' LIMIT 1),
        (SELECT id FROM tamano_empresa WHERE nombre = 'Enterprise' LIMIT 1),
        (SELECT id FROM modalidades WHERE nombre = 'Híbrido' LIMIT 1)
    ),
    -- Empresa 5: RetailTech Solutions
    (
        'RetailTech Solutions',
        'Soluciones tecnológicas para el comercio minorista. Plataformas de e-commerce y sistemas de gestión de inventarios inteligentes.',
        (SELECT id FROM paises WHERE nombre = 'Perú' LIMIT 1),
        (SELECT id FROM industrias WHERE nombre = 'Retail' LIMIT 1),
        (SELECT id FROM usuarios ORDER BY nombre LIMIT 1 OFFSET 4),
        (SELECT id FROM productos ORDER BY nombre LIMIT 1 OFFSET 3),
        (SELECT id FROM estado_empresa WHERE nombre = 'Activa' LIMIT 1),
        (SELECT id FROM relacion_empresa WHERE nombre = 'Prospecto' LIMIT 1),
        (SELECT id FROM tamano_empresa WHERE nombre = 'Mediana' LIMIT 1),
        (SELECT id FROM modalidades WHERE nombre = 'Remoto' LIMIT 1)
    )
) AS e(nombre, descripcion, pais_id, industria_id, kam_id, producto_id, estado_id, relacion_id, tamaño_id, modalidad_id)
WHERE e.pais_id IS NOT NULL 
  AND e.industria_id IS NOT NULL 
  AND e.kam_id IS NOT NULL
  AND e.producto_id IS NOT NULL;

-- 3. VERIFICAR DATOS INSERTADOS
SELECT '=== VERIFICACIÓN FINAL ===' as info;
SELECT COUNT(*) as total_empresas_insertadas FROM empresas;

-- Mostrar empresas creadas con sus relaciones
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

-- 4. MENSAJE DE CONFIRMACIÓN
SELECT '✅ Tabla empresas poblada exitosamente con datos de ejemplo' as resultado; 