-- ====================================
-- VERIFICACIÓN COMPLETA DE ESTRUCTURA PARA CREACIÓN DE RECLUTAMIENTO
-- ====================================

-- 1. Verificar estructura completa de tabla reclutamientos
SELECT '=== ESTRUCTURA TABLA RECLUTAMIENTOS ===' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'reclutamientos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar estructura completa de tabla participantes
SELECT '=== ESTRUCTURA TABLA PARTICIPANTES ===' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'participantes' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar estructura completa de tabla estado_agendamiento_cat
SELECT '=== ESTRUCTURA TABLA ESTADO_AGENDAMIENTO_CAT ===' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'estado_agendamiento_cat' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Verificar estructura completa de tabla roles_empresa
SELECT '=== ESTRUCTURA TABLA ROLES_EMPRESA ===' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'roles_empresa' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Verificar si existe tabla usuarios o profiles
SELECT '=== VERIFICAR TABLA USUARIOS/PROFILES ===' as info;
SELECT 
    table_name,
    EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = table_name 
        AND table_schema = 'public'
    ) as existe
FROM (
    SELECT 'usuarios' as table_name
    UNION SELECT 'profiles'
    UNION SELECT 'auth.users'
) as tablas;

-- 6. Verificar datos existentes en estado_agendamiento_cat
SELECT '=== DATOS EN ESTADO_AGENDAMIENTO_CAT ===' as info;
SELECT * FROM estado_agendamiento_cat ORDER BY nombre;

-- 7. Verificar datos existentes en roles_empresa
SELECT '=== DATOS EN ROLES_EMPRESA ===' as info;
SELECT * FROM roles_empresa ORDER BY nombre;

-- 8. Verificar datos existentes en participantes (solo primeros 5)
SELECT '=== PRIMEROS 5 PARTICIPANTES ===' as info;
SELECT id, nombre, rol_empresa_id, kam_id, empresa_id FROM participantes LIMIT 5;

-- 9. Verificar datos existentes en reclutamientos (solo primeros 5)
SELECT '=== PRIMEROS 5 RECLUTAMIENTOS ===' as info;
SELECT id, investigacion_, participantes_, reclutador_id, estado_agend FROM reclutamientos LIMIT 5;

-- 10. Verificar si existe tabla para participantes internos
SELECT '=== VERIFICAR TABLA PARTICIPANTES_INTERNOS ===' as info;
SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'participantes_internos' 
    AND table_schema = 'public'
) as tabla_participantes_internos_existe;

-- 11. Verificar foreign keys de reclutamientos
SELECT '=== FOREIGN KEYS DE RECLUTAMIENTOS ===' as info;
SELECT 
    tc.constraint_name,
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
AND tc.table_name = 'reclutamientos';

-- 12. Verificar si existe tabla investigaciones
SELECT '=== VERIFICAR TABLA INVESTIGACIONES ===' as info;
SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'investigaciones' 
    AND table_schema = 'public'
) as tabla_investigaciones_existe;

-- Si existe tabla investigaciones, mostrar estructura
SELECT '=== ESTRUCTURA TABLA INVESTIGACIONES (SI EXISTE) ===' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'investigaciones' 
AND table_schema = 'public'
ORDER BY ordinal_position; 