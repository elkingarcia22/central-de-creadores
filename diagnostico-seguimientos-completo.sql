-- ====================================
-- DIAGNÓSTICO COMPLETO: SEGUIMIENTOS
-- ====================================

-- 1. VERIFICAR ESTADO DE LA TABLA
SELECT 
    'ESTADO DE LA TABLA' as seccion,
    schemaname,
    tablename,
    "rowsecurity" as rls_habilitado,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE tablename = 'seguimientos_investigacion';

-- 2. VERIFICAR ESTRUCTURA DE LA TABLA
SELECT 
    'ESTRUCTURA DE LA TABLA' as seccion,
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'seguimientos_investigacion' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. VERIFICAR FOREIGN KEYS
SELECT 
    'FOREIGN KEYS' as seccion,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'seguimientos_investigacion';

-- 4. VERIFICAR POLÍTICAS RLS
SELECT 
    'POLÍTICAS RLS' as seccion,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'seguimientos_investigacion'
ORDER BY cmd, policyname;

-- 5. VERIFICAR ÍNDICES
SELECT 
    'ÍNDICES' as seccion,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'seguimientos_investigacion';

-- 6. VERIFICAR TRIGGERS
SELECT 
    'TRIGGERS' as seccion,
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'seguimientos_investigacion'
AND trigger_schema = 'public';

-- 7. CONTAR REGISTROS
SELECT 
    'CONTEO DE REGISTROS' as seccion,
    COUNT(*) as total_seguimientos,
    COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as pendientes,
    COUNT(CASE WHEN estado = 'en_progreso' THEN 1 END) as en_progreso,
    COUNT(CASE WHEN estado = 'completado' THEN 1 END) as completados,
    COUNT(CASE WHEN estado = 'convertido' THEN 1 END) as convertidos
FROM seguimientos_investigacion;

-- 8. VERIFICAR USUARIO ACTUAL Y AUTENTICACIÓN
SELECT 
    'AUTENTICACIÓN' as seccion,
    auth.uid() as user_id,
    auth.role() as user_role,
    auth.email() as user_email;

-- 9. PROBAR CONSULTA CON RLS
SELECT 
    'PRUEBA CONSULTA CON RLS' as seccion,
    COUNT(*) as total_seguimientos_visibles
FROM seguimientos_investigacion;

-- 10. VERIFICAR ALGUNAS INVESTIGACIONES
SELECT 
    'INVESTIGACIONES DISPONIBLES' as seccion,
    id,
    nombre,
    estado,
    creado_el
FROM investigaciones 
ORDER BY creado_el DESC 
LIMIT 5;

-- 11. VERIFICAR ALGUNOS USUARIOS
SELECT 
    'USUARIOS DISPONIBLES' as seccion,
    id,
    full_name,
    email
FROM profiles 
LIMIT 5;

-- 12. PROBAR INSERCIÓN MANUAL (comentado por seguridad)
/*
INSERT INTO seguimientos_investigacion (
    investigacion_id,
    fecha_seguimiento,
    notas,
    responsable_id,
    estado,
    creado_por
) VALUES (
    'ID_DE_INVESTIGACION_AQUI',
    CURRENT_DATE,
    'Prueba manual de inserción',
    'ID_DE_USUARIO_AQUI',
    'pendiente',
    auth.uid()
) RETURNING id, investigacion_id, fecha_seguimiento;
*/

-- 13. VERIFICAR PERMISOS DE LA TABLA
SELECT 
    'PERMISOS DE LA TABLA' as seccion,
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'seguimientos_investigacion'
AND table_schema = 'public'
ORDER BY grantee, privilege_type;

-- 14. VERIFICAR SI HAY DATOS DE PRUEBA
SELECT 
    'DATOS DE PRUEBA' as seccion,
    id,
    investigacion_id,
    fecha_seguimiento,
    estado,
    creado_el
FROM seguimientos_investigacion 
ORDER BY creado_el DESC 
LIMIT 10; 