-- ====================================
-- DESHABILITAR RLS TEMPORALMENTE PARA PRUEBAS
-- ====================================

-- 1. Verificar estado actual de RLS
SELECT 
    'Estado actual de RLS:' as info,
    schemaname,
    tablename,
    "rowsecurity"
FROM pg_tables 
WHERE tablename = 'seguimientos_investigacion';

-- 2. Deshabilitar RLS temporalmente
ALTER TABLE seguimientos_investigacion DISABLE ROW LEVEL SECURITY;

-- 3. Verificar que RLS está deshabilitado
SELECT 
    'RLS después de deshabilitar:' as info,
    schemaname,
    tablename,
    "rowsecurity"
FROM pg_tables 
WHERE tablename = 'seguimientos_investigacion';

-- 4. Probar consulta sin RLS
SELECT 
    'Consulta SIN RLS:' as info,
    COUNT(*) as total_seguimientos,
    COUNT(CASE WHEN estado = 'convertido' THEN 1 END) as convertidos,
    COUNT(CASE WHEN estado != 'convertido' THEN 1 END) as no_convertidos
FROM seguimientos_investigacion
WHERE investigacion_id = '74ccfacb-6776-4546-a3e9-c07cefd1d6f1';

-- 5. Mostrar todos los seguimientos de la investigación
SELECT 
    'Todos los seguimientos (sin RLS):' as info,
    id,
    estado,
    fecha_seguimiento,
    investigacion_id,
    creado_el
FROM seguimientos_investigacion 
WHERE investigacion_id = '74ccfacb-6776-4546-a3e9-c07cefd1d6f1'
ORDER BY fecha_seguimiento DESC;

-- 6. Verificar seguimientos convertidos específicamente
SELECT 
    'Seguimientos convertidos (sin RLS):' as info,
    id,
    estado,
    fecha_seguimiento,
    investigacion_id
FROM seguimientos_investigacion 
WHERE investigacion_id = '74ccfacb-6776-4546-a3e9-c07cefd1d6f1'
AND estado = 'convertido'
ORDER BY fecha_seguimiento DESC; 