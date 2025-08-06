-- ====================================
-- DIAGNÓSTICO ESPECÍFICO ERROR 400
-- ====================================

-- 1. VERIFICAR LA INVESTIGACIÓN PROBLEMÁTICA
SELECT '=== INVESTIGACIÓN PROBLEMÁTICA ===' as info;

SELECT 
    id,
    nombre,
    estado,
    fecha_inicio,
    fecha_fin,
    producto_id,
    tipo_investigacion_id,
    periodo_id,
    responsable_id,
    implementador_id,
    creado_por,
    tipo_prueba,
    plataforma,
    tipo_sesion,
    libreto,
    link_prueba,
    link_resultados,
    notas_seguimiento,
    riesgo_automatico,
    creado_el,
    actualizado_el
FROM investigaciones 
WHERE id = 'ed58dbf4-f506-4b33-a0b7-1795458a67ff';

-- 2. VERIFICAR SI EXISTEN TODAS LAS COLUMNAS NECESARIAS
SELECT '=== COLUMNAS NECESARIAS ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'investigaciones' 
AND table_schema = 'public'
AND column_name IN (
    'id', 'nombre', 'estado', 'fecha_inicio', 'fecha_fin',
    'producto_id', 'tipo_investigacion_id', 'periodo_id',
    'responsable_id', 'implementador_id', 'creado_por',
    'tipo_prueba', 'plataforma', 'tipo_sesion', 'libreto',
    'link_prueba', 'link_resultados', 'notas_seguimiento',
    'riesgo_automatico', 'creado_el', 'actualizado_el'
)
ORDER BY column_name;

-- 3. VERIFICAR ENUMS ESPECÍFICOS
SELECT '=== ENUMS DE ESTADO ===' as info;

SELECT 
    t.typname as enum_name,
    e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'public'
AND t.typname = 'enum_estado_investigacion'
ORDER BY e.enumsortorder;

-- 4. VERIFICAR POLÍTICAS RLS ESPECÍFICAS PARA UPDATE
SELECT '=== POLÍTICAS RLS UPDATE ===' as info;

SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'investigaciones'
AND cmd = 'UPDATE';

-- 5. PROBAR ACTUALIZACIÓN SIMPLE
SELECT '=== PRUEBA DE ACTUALIZACIÓN ===' as info;

-- Intentar una actualización simple para ver si funciona
UPDATE investigaciones 
SET actualizado_el = NOW()
WHERE id = 'ed58dbf4-f506-4b33-a0b7-1795458a67ff'
RETURNING id, nombre, actualizado_el;

-- 6. VERIFICAR PERMISOS DE USUARIO
SELECT '=== VERIFICAR USUARIO ACTUAL ===' as info;

SELECT 
    current_user as usuario_actual,
    session_user as usuario_sesion,
    current_database() as base_datos_actual;

-- 7. VERIFICAR SI HAY TRIGGERS QUE PUEDAN CAUSAR PROBLEMAS
SELECT '=== VERIFICAR TRIGGERS ===' as info;

SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'investigaciones'
AND trigger_schema = 'public'; 