-- ========================================================
-- ANÁLISIS COMPLETO DE LA TABLA INVESTIGACIONES EXISTENTE
-- ========================================================

-- 1. ESTRUCTURA BÁSICA DE LA TABLA
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length,
    numeric_precision,
    numeric_scale,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'investigaciones' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. FOREIGN KEYS DE LA TABLA
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_type
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'investigaciones' 
AND tc.constraint_type = 'FOREIGN KEY';

-- 3. ÍNDICES DE LA TABLA
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'investigaciones';

-- 4. TRIGGERS DE LA TABLA
SELECT 
    trigger_name,
    trigger_schema,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'investigaciones';

-- 5. ENUMS RELACIONADOS CON INVESTIGACIONES
SELECT 
    t.typname as enum_name,
    e.enumlabel as enum_value,
    e.enumsortorder
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid 
WHERE t.typname LIKE '%investigacion%' OR t.typname LIKE '%estado%' OR t.typname LIKE '%tipo%'
ORDER BY t.typname, e.enumsortorder;

-- 6. DATOS EXISTENTES EN LA TABLA INVESTIGACIONES
SELECT 
    COUNT(*) as total_investigaciones
FROM investigaciones;

-- 7. PRIMEROS 5 REGISTROS PARA VER LA ESTRUCTURA REAL
SELECT * 
FROM investigaciones 
ORDER BY 
    CASE 
        WHEN creado_el IS NOT NULL THEN creado_el
        ELSE NOW()
    END DESC
LIMIT 5;

-- 8. VERIFICAR TABLAS RELACIONADAS QUE PODRÍAN EXISTIR
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'productos', 
    'tipos_investigacion', 
    'tipo_investigacion',
    'periodo', 
    'periodos',
    'profiles', 
    'usuarios',
    'estado_reclutamiento_cat',
    'riesgo_cat'
)
ORDER BY table_name;

-- 9. VERIFICAR SI EXISTE LA VISTA investigaciones_con_usuarios
SELECT 
    table_name,
    'VIEW' as objeto_tipo
FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name LIKE '%investigacion%';

-- 10. COLUMNAS DE FOREIGN KEYS Y SUS REFERENCIAS
SELECT 
    col.column_name,
    col.data_type,
    col.is_nullable,
    CASE 
        WHEN col.column_name LIKE '%_id' THEN 
            CASE 
                WHEN col.column_name = 'responsable_id' THEN 'profiles o auth.users'
                WHEN col.column_name = 'implementador_id' THEN 'profiles o auth.users'
                WHEN col.column_name = 'creado_por' THEN 'profiles o auth.users'
                WHEN col.column_name = 'producto_id' THEN 'productos'
                WHEN col.column_name = 'tipo_investigacion_id' THEN 'tipos_investigacion'
                WHEN col.column_name = 'periodo_id' THEN 'periodo'
                WHEN col.column_name = 'estado_reclutamiento' THEN 'estado_reclutamiento_cat'
                WHEN col.column_name = 'riesgo' THEN 'riesgo_cat'
                ELSE 'desconocido'
            END
        ELSE 'no es FK'
    END as posible_referencia
FROM information_schema.columns col
WHERE col.table_name = 'investigaciones' 
AND col.table_schema = 'public'
AND (col.column_name LIKE '%_id' OR col.column_name = 'creado_por' OR col.column_name IN ('estado_reclutamiento', 'riesgo'))
ORDER BY col.ordinal_position;

-- 11. VERIFICAR RLS (Row Level Security)
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'investigaciones';

-- 12. POLÍTICAS RLS SI EXISTEN
SELECT 
    pol.polname as policy_name,
    pol.polcmd as command,
    pol.polroles::regrole[] as roles,
    pol.polqual as qual,
    pol.polwithcheck as with_check
FROM pg_policy pol
JOIN pg_class pc ON pol.polrelid = pc.oid
JOIN pg_namespace pn ON pc.relnamespace = pn.oid
WHERE pc.relname = 'investigaciones' 
AND pn.nspname = 'public';

-- 13. VERIFICAR ESTRUCTURA DE TABLAS RELACIONADAS
-- Productos
SELECT 'productos' as tabla, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'productos' AND table_schema = 'public'
UNION ALL
-- Tipos investigación
SELECT 'tipos_investigacion' as tabla, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tipos_investigacion' AND table_schema = 'public'
UNION ALL
-- Período
SELECT 'periodo' as tabla, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'periodo' AND table_schema = 'public'
UNION ALL
-- Profiles
SELECT 'profiles' as tabla, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public';

-- 14. VERIFICAR DATOS EN TABLAS RELACIONADAS
SELECT 'productos' as tabla, COUNT(*) as registros FROM productos
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'productos')
UNION ALL
SELECT 'tipos_investigacion' as tabla, COUNT(*) as registros FROM tipos_investigacion
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tipos_investigacion')
UNION ALL
SELECT 'periodo' as tabla, COUNT(*) as registros FROM periodo
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'periodo');

-- 15. MOSTRAR EJEMPLOS DE DATOS DE CATÁLOGOS
-- Productos
SELECT 'PRODUCTOS:' as info;
SELECT id, nombre FROM productos LIMIT 3;

-- Tipos investigación
SELECT 'TIPOS INVESTIGACIÓN:' as info;
SELECT id, nombre FROM tipos_investigacion LIMIT 3;

-- Períodos
SELECT 'PERÍODOS:' as info;
SELECT id, nombre FROM periodo LIMIT 3;

-- 16. VERIFICAR RELACIONES REALES EN LOS DATOS
SELECT 
    'Campos con foreign keys en investigaciones:' as info,
    COUNT(CASE WHEN producto_id IS NOT NULL THEN 1 END) as con_producto,
    COUNT(CASE WHEN tipo_investigacion_id IS NOT NULL THEN 1 END) as con_tipo,
    COUNT(CASE WHEN periodo_id IS NOT NULL THEN 1 END) as con_periodo,
    COUNT(CASE WHEN responsable_id IS NOT NULL THEN 1 END) as con_responsable,
    COUNT(CASE WHEN implementador_id IS NOT NULL THEN 1 END) as con_implementador,
    COUNT(CASE WHEN creado_por IS NOT NULL THEN 1 END) as con_creador
FROM investigaciones;

-- 17. VERIFICAR USUARIOS EN PROFILES
SELECT 
    'USUARIOS EN PROFILES:' as info,
    COUNT(*) as total_usuarios
FROM profiles;

SELECT id, full_name, email 
FROM profiles 
LIMIT 3;

-- 18. MOSTRAR COLUMNAS ESPECÍFICAS QUE BUSCA LA APLICACIÓN
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
    CASE 
        WHEN creado_el IS NOT NULL THEN creado_el
        WHEN created_at IS NOT NULL THEN created_at
        ELSE NULL
    END as fecha_creacion_real
FROM investigaciones 
ORDER BY 
    CASE 
        WHEN creado_el IS NOT NULL THEN creado_el
        WHEN created_at IS NOT NULL THEN created_at
        ELSE NOW()
    END DESC
LIMIT 3; 