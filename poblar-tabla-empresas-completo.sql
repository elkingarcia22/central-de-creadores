-- ====================================
-- POBLAR TABLA EMPRESAS CON DATOS DE EJEMPLO
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- 1. VERIFICAR TABLAS EXISTENTES Y SUS DATOS
SELECT '=== VERIFICANDO TABLAS EXISTENTES ===' as info;

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

-- 2. OBTENER IDs DE REFERENCIA PARA LAS RELACIONES
-- Obtener algunos países para usar en las empresas
WITH paises_ref AS (
    SELECT id, nombre FROM paises ORDER BY nombre LIMIT 5
)
SELECT 'Países de referencia:' as info, id, nombre FROM paises_ref;

-- Obtener algunas industrias para usar en las empresas
WITH industrias_ref AS (
    SELECT id, nombre FROM industrias ORDER BY nombre LIMIT 5
)
SELECT 'Industrias de referencia:' as info, id, nombre FROM industrias_ref;

-- Obtener algunos usuarios para usar como KAM
WITH usuarios_ref AS (
    SELECT id, nombre, correo FROM usuarios ORDER BY nombre LIMIT 5
)
SELECT 'Usuarios de referencia para KAM:' as info, id, nombre, correo FROM usuarios_ref;

-- Obtener algunos productos para usar en las empresas
WITH productos_ref AS (
    SELECT id, nombre FROM productos ORDER BY nombre LIMIT 5
)
SELECT 'Productos de referencia:' as info, id, nombre FROM productos_ref;

-- 3. POBLAR TABLA EMPRESAS CON DATOS DE EJEMPLO
-- Primero verificamos si ya hay datos
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
        (SELECT id FROM estado_empresa_cat WHERE nombre = 'Activa' LIMIT 1),
        (SELECT id FROM relacion_empresa_cat WHERE nombre = 'Cliente' LIMIT 1),
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
        (SELECT id FROM estado_empresa_cat WHERE nombre = 'Activa' LIMIT 1),
        (SELECT id FROM relacion_empresa_cat WHERE nombre = 'Prospecto' LIMIT 1),
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
        (SELECT id FROM estado_empresa_cat WHERE nombre = 'Activa' LIMIT 1),
        (SELECT id FROM relacion_empresa_cat WHERE nombre = 'Cliente' LIMIT 1),
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
        (SELECT id FROM estado_empresa_cat WHERE nombre = 'Activa' LIMIT 1),
        (SELECT id FROM relacion_empresa_cat WHERE nombre = 'Cliente' LIMIT 1),
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
        (SELECT id FROM estado_empresa_cat WHERE nombre = 'Activa' LIMIT 1),
        (SELECT id FROM relacion_empresa_cat WHERE nombre = 'Prospecto' LIMIT 1),
        (SELECT id FROM tamano_empresa WHERE nombre = 'Mediana' LIMIT 1),
        (SELECT id FROM modalidades WHERE nombre = 'Remoto' LIMIT 1)
    ),
    -- Empresa 6: EnergyCorp
    (
        'EnergyCorp',
        'Empresa del sector energético enfocada en energías renovables. Desarrollo de soluciones para la gestión eficiente de recursos energéticos.',
        (SELECT id FROM paises WHERE nombre = 'Brasil' LIMIT 1),
        (SELECT id FROM industrias WHERE nombre = 'Oil & Gas / Energy / Mining / Environment' LIMIT 1),
        (SELECT id FROM usuarios ORDER BY nombre LIMIT 1),
        (SELECT id FROM productos ORDER BY nombre LIMIT 1),
        (SELECT id FROM estado_empresa_cat WHERE nombre = 'Activa' LIMIT 1),
        (SELECT id FROM relacion_empresa_cat WHERE nombre = 'Cliente' LIMIT 1),
        (SELECT id FROM tamano_empresa WHERE nombre = 'Grande' LIMIT 1),
        (SELECT id FROM modalidades WHERE nombre = 'Presencial' LIMIT 1)
    ),
    -- Empresa 7: EduTech Pro
    (
        'EduTech Pro',
        'Plataforma educativa digital para instituciones académicas. Herramientas de aprendizaje virtual y gestión de contenido educativo.',
        (SELECT id FROM paises WHERE nombre = 'Ecuador' LIMIT 1),
        (SELECT id FROM industrias WHERE nombre = 'Services Companies' LIMIT 1),
        (SELECT id FROM usuarios ORDER BY nombre LIMIT 1 OFFSET 1),
        (SELECT id FROM productos ORDER BY nombre LIMIT 1 OFFSET 4),
        (SELECT id FROM estado_empresa_cat WHERE nombre = 'Activa' LIMIT 1),
        (SELECT id FROM relacion_empresa_cat WHERE nombre = 'Prospecto' LIMIT 1),
        (SELECT id FROM tamano_empresa WHERE nombre = 'Pequeña' LIMIT 1),
        (SELECT id FROM modalidades WHERE nombre = 'Remoto' LIMIT 1)
    ),
    -- Empresa 8: LogisticsHub
    (
        'LogisticsHub',
        'Sistema de gestión logística y cadena de suministros. Optimización de rutas de transporte y gestión de inventarios en tiempo real.',
        (SELECT id FROM paises WHERE nombre = 'Colombia' LIMIT 1),
        (SELECT id FROM industrias WHERE nombre = 'Transport & Logistics' LIMIT 1),
        (SELECT id FROM usuarios ORDER BY nombre LIMIT 1 OFFSET 2),
        (SELECT id FROM productos ORDER BY nombre LIMIT 1),
        (SELECT id FROM estado_empresa_cat WHERE nombre = 'Activa' LIMIT 1),
        (SELECT id FROM relacion_empresa_cat WHERE nombre = 'Cliente' LIMIT 1),
        (SELECT id FROM tamano_empresa WHERE nombre = 'Mediana' LIMIT 1),
        (SELECT id FROM modalidades WHERE nombre = 'Híbrido' LIMIT 1)
    )
) AS e(nombre, descripcion, pais_id, industria_id, kam_id, producto_id, estado_id, relacion_id, tamaño_id, modalidad_id)
WHERE e.pais_id IS NOT NULL 
  AND e.industria_id IS NOT NULL 
  AND e.kam_id IS NOT NULL
  AND e.producto_id IS NOT NULL;

-- 4. VERIFICAR DATOS INSERTADOS
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
    ec.nombre as estado,
    rc.nombre as relacion,
    te.nombre as tamaño,
    m.nombre as modalidad
FROM empresas e
LEFT JOIN paises p ON e.pais = p.id
LEFT JOIN industrias i ON e.industria = i.id
LEFT JOIN usuarios u ON e.kam_id = u.id
LEFT JOIN productos pr ON e.producto_id = pr.id
LEFT JOIN estado_empresa_cat ec ON e.estado = ec.id
LEFT JOIN relacion_empresa_cat rc ON e.relacion = rc.id
LEFT JOIN tamano_empresa te ON e.tamaño = te.id
LEFT JOIN modalidades m ON e.modalidad = m.id
ORDER BY e.nombre;

-- 5. VERIFICAR FOREIGN KEYS
SELECT '=== VERIFICANDO FOREIGN KEYS ===' as info;

-- Verificar FKs de empresas
SELECT 
    tc.constraint_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'empresas'
ORDER BY kcu.column_name;

-- 6. MENSAJE DE CONFIRMACIÓN
SELECT '✅ Tabla empresas poblada exitosamente con datos de ejemplo' as resultado; 