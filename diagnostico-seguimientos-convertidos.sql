-- ====================================
-- DIAGNÓSTICO: SEGUIMIENTOS CONVERTIDOS
-- ====================================

-- 1. Verificar si hay seguimientos convertidos en la base de datos
SELECT 
    'Seguimientos convertidos en BD:' as info,
    COUNT(*) as total_convertidos,
    COUNT(CASE WHEN investigacion_id = '74ccfacb-6776-4546-a3e9-c07cefd1d6f1' THEN 1 END) as en_investigacion_especifica
FROM seguimientos_investigacion 
WHERE estado = 'convertido';

-- 2. Verificar todos los seguimientos de la investigación específica
SELECT 
    'Todos los seguimientos de la investigación:' as info,
    id,
    estado,
    fecha_seguimiento,
    investigacion_id,
    creado_el
FROM seguimientos_investigacion 
WHERE investigacion_id = '74ccfacb-6776-4546-a3e9-c07cefd1d6f1'
ORDER BY fecha_seguimiento DESC;

-- 3. Verificar políticas RLS actuales
SELECT 
    'Políticas RLS actuales:' as info,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'seguimientos_investigacion'
ORDER BY cmd, policyname;

-- 4. Probar consulta con RLS
SELECT 
    'Consulta con RLS (debería mostrar todos):' as info,
    COUNT(*) as total_seguimientos,
    COUNT(CASE WHEN estado = 'convertido' THEN 1 END) as convertidos,
    COUNT(CASE WHEN estado != 'convertido' THEN 1 END) as no_convertidos
FROM seguimientos_investigacion
WHERE investigacion_id = '74ccfacb-6776-4546-a3e9-c07cefd1d6f1';

-- 5. Probar consulta SIN RLS (para comparar)
SELECT 
    'Consulta SIN RLS (para comparar):' as info,
    COUNT(*) as total_seguimientos,
    COUNT(CASE WHEN estado = 'convertido' THEN 1 END) as convertidos,
    COUNT(CASE WHEN estado != 'convertido' THEN 1 END) as no_convertidos
FROM seguimientos_investigacion
WHERE investigacion_id = '74ccfacb-6776-4546-a3e9-c07cefd1d6f1';

-- 6. Verificar si RLS está habilitado
SELECT 
    'RLS habilitado:' as info,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'seguimientos_investigacion';

-- 7. Verificar usuario actual
SELECT 
    'Usuario actual:' as info,
    auth.uid() as user_id,
    auth.role() as user_role;

-- 8. Probar consulta específica para seguimientos convertidos
SELECT 
    'Seguimientos convertidos específicos:' as info,
    id,
    estado,
    fecha_seguimiento,
    investigacion_id
FROM seguimientos_investigacion 
WHERE investigacion_id = '74ccfacb-6776-4546-a3e9-c07cefd1d6f1'
AND estado = 'convertido'; 