-- ====================================
-- HABILITAR RLS CON POLÍTICAS PERMISIVAS
-- ====================================

-- 1. Habilitar RLS
ALTER TABLE seguimientos_investigacion ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar todas las políticas existentes
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

-- 3. Crear política muy permisiva para SELECT
CREATE POLICY "permitir_todo_select" ON seguimientos_investigacion
    FOR SELECT 
    USING (true);

-- 4. Crear política permisiva para INSERT
CREATE POLICY "permitir_insert_autenticado" ON seguimientos_investigacion
    FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

-- 5. Crear política permisiva para UPDATE
CREATE POLICY "permitir_update_autenticado" ON seguimientos_investigacion
    FOR UPDATE 
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- 6. Crear política permisiva para DELETE
CREATE POLICY "permitir_delete_autenticado" ON seguimientos_investigacion
    FOR DELETE 
    USING (auth.role() = 'authenticated');

-- 7. Verificar que las políticas se crearon
SELECT 
    'Políticas creadas:' as info,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'seguimientos_investigacion'
ORDER BY cmd, policyname;

-- 8. Verificar que RLS está habilitado
SELECT 
    'RLS habilitado:' as info,
    schemaname,
    tablename,
    "rowsecurity"
FROM pg_tables 
WHERE tablename = 'seguimientos_investigacion';

-- 9. Probar consulta con RLS habilitado
SELECT 
    'Consulta con RLS habilitado:' as info,
    COUNT(*) as total_seguimientos,
    COUNT(CASE WHEN estado = 'convertido' THEN 1 END) as convertidos,
    COUNT(CASE WHEN estado != 'convertido' THEN 1 END) as no_convertidos
FROM seguimientos_investigacion
WHERE investigacion_id = '74ccfacb-6776-4546-a3e9-c07cefd1d6f1';

-- 10. Mostrar seguimientos convertidos
SELECT 
    'Seguimientos convertidos (con RLS):' as info,
    id,
    estado,
    fecha_seguimiento,
    investigacion_id
FROM seguimientos_investigacion 
WHERE investigacion_id = '74ccfacb-6776-4546-a3e9-c07cefd1d6f1'
AND estado = 'convertido'
ORDER BY fecha_seguimiento DESC; 