-- ====================================
-- FIX TEMPORAL: POLÍTICAS RLS PERMISIVAS PARA SEGUIMIENTOS
-- ====================================

-- 1. VERIFICAR ESTADO ACTUAL
SELECT 
    'ESTADO ACTUAL' as info,
    schemaname,
    tablename,
    "rowsecurity"
FROM pg_tables 
WHERE tablename = 'seguimientos_investigacion';

-- 2. ELIMINAR TODAS LAS POLÍTICAS EXISTENTES
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

-- 3. CREAR POLÍTICAS MUY PERMISIVAS (TEMPORAL PARA DIAGNÓSTICO)
-- Política para SELECT - permitir ver todo
CREATE POLICY "temp_select_all" ON seguimientos_investigacion
    FOR SELECT 
    USING (true);

-- Política para INSERT - permitir insertar para usuarios autenticados
CREATE POLICY "temp_insert_authenticated" ON seguimientos_investigacion
    FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

-- Política para UPDATE - permitir actualizar para usuarios autenticados
CREATE POLICY "temp_update_authenticated" ON seguimientos_investigacion
    FOR UPDATE 
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Política para DELETE - permitir eliminar para usuarios autenticados
CREATE POLICY "temp_delete_authenticated" ON seguimientos_investigacion
    FOR DELETE 
    USING (auth.role() = 'authenticated');

-- 4. VERIFICAR QUE LAS NUEVAS POLÍTICAS SE CREARON
SELECT 
    'NUEVAS POLÍTICAS CREADAS' as info,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'seguimientos_investigacion'
ORDER BY cmd, policyname;

-- 5. VERIFICAR QUE RLS ESTÁ HABILITADO
SELECT 
    'RLS HABILITADO' as info,
    schemaname,
    tablename,
    "rowsecurity"
FROM pg_tables 
WHERE tablename = 'seguimientos_investigacion';

-- 6. PROBAR CONSULTA PARA VERIFICAR QUE FUNCIONA
SELECT 
    'PRUEBA DE CONSULTA' as info,
    COUNT(*) as total_seguimientos
FROM seguimientos_investigacion;

-- 7. MOSTRAR ALGUNOS SEGUIMIENTOS SI EXISTEN
SELECT 
    'SEGUIMIENTOS EXISTENTES' as info,
    id,
    investigacion_id,
    fecha_seguimiento,
    estado,
    creado_el
FROM seguimientos_investigacion 
ORDER BY creado_el DESC 
LIMIT 5;

-- 8. VERIFICAR USUARIO ACTUAL
SELECT 
    'USUARIO ACTUAL' as info,
    auth.uid() as user_id,
    auth.role() as user_role,
    auth.email() as user_email; 