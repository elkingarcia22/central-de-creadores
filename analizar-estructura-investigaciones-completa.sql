-- =====================================================
-- ANÁLISIS COMPLETO DE LA TABLA INVESTIGACIONES
-- =====================================================

-- 1. ESTRUCTURA DE LA TABLA INVESTIGACIONES
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'investigaciones' 
ORDER BY ordinal_position;

-- 2. FOREIGN KEYS DE LA TABLA INVESTIGACIONES
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'investigaciones';

-- 3. ENUMS USADOS EN INVESTIGACIONES
SELECT 
    t.typname AS enum_name,
    e.enumlabel AS enum_value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname IN (
    'enum_estado_investigacion',
    'enum_plataforma',
    'enum_tipo_prueba',
    'enum_tipo_sesion'
)
ORDER BY t.typname, e.enumsortorder;

-- 4. DATOS DE LA TABLA PRODUCTOS
SELECT 
    id,
    nombre,
    descripcion,
    activo,
    created_at,
    updated_at
FROM productos
ORDER BY nombre;

-- 5. DATOS DE LA TABLA TIPOS_INVESTIGACION
SELECT 
    id,
    nombre,
    descripcion,
    activo,
    created_at,
    updated_at
FROM tipos_investigacion
ORDER BY nombre;

-- 6. DATOS DE LA TABLA PERIODO
SELECT 
    id,
    nombre,
    etiqueta,
    ano,
    trimestre,
    activo,
    created_at,
    updated_at
FROM periodo
ORDER BY ano DESC, trimestre;

-- 7. DATOS DE LA TABLA ESTADO_RECLUTAMIENTO_CAT
SELECT 
    id,
    nombre,
    descripcion,
    activo,
    created_at,
    updated_at
FROM estado_reclutamiento_cat
ORDER BY nombre;

-- 8. DATOS DE LA TABLA RIESGO_CAT
SELECT 
    id,
    nombre,
    descripcion,
    nivel,
    activo,
    created_at,
    updated_at
FROM riesgo_cat
ORDER BY nivel;

-- 9. USUARIOS DISPONIBLES (desde la vista usuarios_con_roles)
SELECT 
    id,
    full_name,
    email,
    avatar_url,
    roles,
    created_at,
    updated_at
FROM usuarios_con_roles
ORDER BY full_name;

-- 10. INVESTIGACIONES EXISTENTES (primeras 5)
SELECT 
    id,
    nombre,
    estado,
    producto_id,
    tipo_investigacion_id,
    periodo_id,
    responsable_id,
    implementador_id,
    creado_por,
    fecha_inicio,
    fecha_fin,
    tipo_prueba,
    plataforma,
    tipo_sesion,
    created_at
FROM investigaciones
ORDER BY created_at DESC
LIMIT 5;

-- 11. CONTEO DE REGISTROS EN CADA TABLA
SELECT 'productos' as tabla, COUNT(*) as total FROM productos
UNION ALL
SELECT 'tipos_investigacion' as tabla, COUNT(*) as total FROM tipos_investigacion
UNION ALL
SELECT 'periodo' as tabla, COUNT(*) as total FROM periodo
UNION ALL
SELECT 'estado_reclutamiento_cat' as tabla, COUNT(*) as total FROM estado_reclutamiento_cat
UNION ALL
SELECT 'riesgo_cat' as tabla, COUNT(*) as total FROM riesgo_cat
UNION ALL
SELECT 'usuarios_con_roles' as tabla, COUNT(*) as total FROM usuarios_con_roles
UNION ALL
SELECT 'investigaciones' as tabla, COUNT(*) as total FROM investigaciones
ORDER BY tabla;

-- 12. VERIFICAR SI HAY RESTRICCIONES ADICIONALES
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'investigaciones'::regclass; 