-- ====================================
-- CORREGIR POLÍTICAS RLS PARA SEGUIMIENTOS CONVERTIDOS
-- ====================================

-- 1. Verificar estado actual de RLS
SELECT 
    'Estado actual de RLS:' as info,
    schemaname,
    tablename,
    "rowsecurity"
FROM pg_tables 
WHERE tablename = 'seguimientos_investigacion';

-- 2. Verificar políticas actuales
SELECT 
    'Políticas actuales:' as info,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'seguimientos_investigacion'
ORDER BY cmd, policyname;

-- 3. Eliminar todas las políticas existentes
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'seguimientos_investigacion'
    LOOP
        EXECUTE 'DROP POLICY "' || policy_record.policyname || '" ON seguimientos_investigacion';
        RAISE NOTICE 'Eliminada política: %', policy_record.policyname;
    END LOOP;
END $$;

-- 4. Crear nuevas políticas que permitan ver todos los seguimientos
-- Política para SELECT - permitir ver todos los seguimientos para usuarios autenticados
CREATE POLICY "usuarios_autenticados_pueden_ver_seguimientos" ON seguimientos_investigacion
    FOR SELECT 
    USING (auth.role() = 'authenticated');

-- Política para INSERT - permitir crear seguimientos para usuarios autenticados
CREATE POLICY "usuarios_autenticados_pueden_crear_seguimientos" ON seguimientos_investigacion
    FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

-- Política para UPDATE - permitir actualizar seguimientos para usuarios autenticados
CREATE POLICY "usuarios_autenticados_pueden_actualizar_seguimientos" ON seguimientos_investigacion
    FOR UPDATE 
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Política para DELETE - permitir eliminar seguimientos para usuarios autenticados
CREATE POLICY "usuarios_autenticados_pueden_eliminar_seguimientos" ON seguimientos_investigacion
    FOR DELETE 
    USING (auth.role() = 'authenticated');

-- 5. Verificar que las nuevas políticas se crearon correctamente
SELECT 
    'Nuevas políticas creadas:' as info,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'seguimientos_investigacion'
ORDER BY cmd, policyname;

-- 6. Verificar que RLS está habilitado
SELECT 
    'RLS habilitado:' as info,
    schemaname,
    tablename,
    "rowsecurity"
FROM pg_tables 
WHERE tablename = 'seguimientos_investigacion';

-- 7. Probar consulta para verificar que funciona
SELECT 
    'Prueba de consulta:' as info,
    COUNT(*) as total_seguimientos,
    COUNT(CASE WHEN estado = 'convertido' THEN 1 END) as convertidos,
    COUNT(CASE WHEN estado != 'convertido' THEN 1 END) as no_convertidos
FROM seguimientos_investigacion
WHERE investigacion_id = '74ccfacb-6776-4546-a3e9-c07cefd1d6f1';

-- 8. Mostrar todos los seguimientos de la investigación específica
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