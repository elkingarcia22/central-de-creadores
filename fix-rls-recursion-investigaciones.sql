-- ====================================
-- SOLUCIÓN: Recursión infinita en políticas RLS - investigaciones
-- ====================================

-- 1. DESHABILITAR RLS temporalmente para limpiar
ALTER TABLE investigaciones DISABLE ROW LEVEL SECURITY;

-- 2. ELIMINAR todas las políticas existentes que pueden estar causando recursión
DROP POLICY IF EXISTS "Usuarios pueden ver investigaciones" ON investigaciones;
DROP POLICY IF EXISTS "Usuarios pueden crear investigaciones" ON investigaciones;
DROP POLICY IF EXISTS "Usuarios pueden actualizar investigaciones" ON investigaciones;
DROP POLICY IF EXISTS "Usuarios pueden eliminar investigaciones" ON investigaciones;
DROP POLICY IF EXISTS "investigaciones_select_policy" ON investigaciones;
DROP POLICY IF EXISTS "investigaciones_insert_policy" ON investigaciones;
DROP POLICY IF EXISTS "investigaciones_update_policy" ON investigaciones;
DROP POLICY IF EXISTS "investigaciones_delete_policy" ON investigaciones;

-- 3. CREAR políticas simples y seguras SIN recursión

-- Política para SELECT (lectura) - Solo usuarios autenticados
CREATE POLICY "investigaciones_select_simple" ON investigaciones
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Política para INSERT (creación) - Solo usuarios autenticados
CREATE POLICY "investigaciones_insert_simple" ON investigaciones
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Política para UPDATE (actualización) - Solo usuarios autenticados
CREATE POLICY "investigaciones_update_simple" ON investigaciones
    FOR UPDATE
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Política para DELETE (eliminación) - Solo usuarios autenticados
CREATE POLICY "investigaciones_delete_simple" ON investigaciones
    FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- 4. REACTIVAR RLS con las nuevas políticas simples
ALTER TABLE investigaciones ENABLE ROW LEVEL SECURITY;

-- 5. VERIFICAR que las políticas se crearon correctamente
SELECT 
    schemaname,
    tablename, 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'investigaciones';

-- ====================================
-- EXPLICACIÓN DEL PROBLEMA:
-- ====================================
-- El error "infinite recursion detected" ocurre cuando:
-- 1. Las políticas RLS hacen referencia a funciones que consultan la misma tabla
-- 2. Hay políticas que se referencian entre sí
-- 3. Las condiciones de las políticas crean bucles lógicos
--
-- SOLUCIÓN APLICADA:
-- - Políticas simples que solo verifican autenticación
-- - Sin referencias a otras tablas o funciones complejas
-- - Sin condiciones que puedan crear bucles
-- ====================================

-- 6. PROBAR que funciona
-- SELECT COUNT(*) FROM investigaciones; -- Debe funcionar sin error 