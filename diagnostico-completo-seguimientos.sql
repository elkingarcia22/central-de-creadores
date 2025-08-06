-- ====================================
-- DIAGNÓSTICO COMPLETO: SEGUIMIENTOS CONVERTIDOS
-- ====================================

-- 1. Verificar usuario actual y autenticación
SELECT 
    'Usuario actual:' as info,
    auth.uid() as user_id,
    auth.role() as user_role;

-- 2. Verificar si la tabla existe y su estructura
SELECT 
    'Tabla seguimientos_investigacion existe:' as info,
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_name = 'seguimientos_investigacion' 
AND table_schema = 'public';

-- 3. Verificar estructura de la tabla
SELECT 
    'Estructura de la tabla:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'seguimientos_investigacion' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Verificar si RLS está habilitado
SELECT 
    'RLS habilitado:' as info,
    schemaname,
    tablename,
    "rowsecurity"
FROM pg_tables 
WHERE tablename = 'seguimientos_investigacion';

-- 5. Verificar políticas RLS actuales
SELECT 
    'Políticas RLS actuales:' as info,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'seguimientos_investigacion'
ORDER BY cmd, policyname;

-- 6. Contar todos los seguimientos en la base de datos
SELECT 
    'Total de seguimientos en BD:' as info,
    COUNT(*) as total_seguimientos
FROM seguimientos_investigacion;

-- 7. Verificar seguimientos convertidos en toda la BD
SELECT 
    'Seguimientos convertidos en toda la BD:' as info,
    COUNT(*) as total_convertidos
FROM seguimientos_investigacion 
WHERE estado = 'convertido';

-- 8. Verificar todos los estados posibles
SELECT 
    'Estados únicos en la tabla:' as info,
    estado,
    COUNT(*) as cantidad
FROM seguimientos_investigacion 
GROUP BY estado
ORDER BY estado;

-- 9. Verificar seguimientos de la investigación específica
SELECT 
    'Seguimientos de la investigación específica:' as info,
    id,
    estado,
    fecha_seguimiento,
    investigacion_id,
    creado_el
FROM seguimientos_investigacion 
WHERE investigacion_id = '74ccfacb-6776-4546-a3e9-c07cefd1d6f1'
ORDER BY fecha_seguimiento DESC;

-- 10. Probar consulta con RLS (usuario autenticado)
SELECT 
    'Consulta con RLS (usuario autenticado):' as info,
    COUNT(*) as total_seguimientos,
    COUNT(CASE WHEN estado = 'convertido' THEN 1 END) as convertidos,
    COUNT(CASE WHEN estado != 'convertido' THEN 1 END) as no_convertidos
FROM seguimientos_investigacion
WHERE investigacion_id = '74ccfacb-6776-4546-a3e9-c07cefd1d6f1';

-- 11. Verificar que el usuario actual puede ver seguimientos convertidos
SELECT 
    'Seguimientos convertidos visibles para el usuario actual:' as info,
    id,
    estado,
    fecha_seguimiento,
    investigacion_id
FROM seguimientos_investigacion 
WHERE investigacion_id = '74ccfacb-6776-4546-a3e9-c07cefd1d6f1'
AND estado = 'convertido'
ORDER BY fecha_seguimiento DESC;

-- 12. Verificar constraint CHECK para el campo estado
SELECT 
    'Constraint CHECK para estado:' as info,
    conname,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'seguimientos_investigacion'::regclass 
AND contype = 'c';

-- 13. Probar inserción de un seguimiento de prueba (comentado por seguridad)
-- INSERT INTO seguimientos_investigacion (investigacion_id, fecha_seguimiento, notas, responsable_id, estado, creado_por)
-- VALUES ('74ccfacb-6776-4546-a3e9-c07cefd1d6f1', CURRENT_DATE, 'Seguimiento de prueba para diagnóstico', 
--         (SELECT id FROM profiles LIMIT 1), 'convertido', auth.uid())
-- ON CONFLICT DO NOTHING;

-- 14. Verificar si hay algún trigger que pueda estar interfiriendo
SELECT 
    'Triggers en la tabla:' as info,
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'seguimientos_investigacion'
AND trigger_schema = 'public'; 