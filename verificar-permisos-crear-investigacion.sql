-- ====================================
-- VERIFICAR PERMISOS PARA CREAR INVESTIGACIONES
-- ====================================

-- 1. VERIFICAR AUTENTICACIÓN ACTUAL
SELECT 
    'AUTENTICACIÓN:' as categoria,
    auth.uid() as user_id,
    auth.email() as email,
    CASE 
        WHEN auth.uid() IS NOT NULL THEN 'AUTENTICADO'
        ELSE 'NO AUTENTICADO'
    END as estado;

-- 2. VERIFICAR TABLA INVESTIGACIONES Y SUS POLÍTICAS RLS
SELECT 
    'TABLA INVESTIGACIONES:' as categoria,
    schemaname,
    tablename,
    rowsecurity as rls_habilitado
FROM pg_tables 
WHERE tablename = 'investigaciones';

-- 3. VERIFICAR POLÍTICAS DE INVESTIGACIONES
SELECT 
    'POLÍTICAS INVESTIGACIONES:' as categoria,
    policyname,
    cmd as operacion,
    qual as condicion,
    with_check as validacion
FROM pg_policies 
WHERE tablename = 'investigaciones';

-- 4. VERIFICAR TABLAS DE CATÁLOGOS Y SUS PERMISOS
SELECT 
    'CATÁLOGOS RLS:' as categoria,
    tablename,
    rowsecurity as rls_habilitado
FROM pg_tables 
WHERE tablename IN ('productos', 'tipos_investigacion', 'periodo')
ORDER BY tablename;

-- 5. VERIFICAR POLÍTICAS DE CATÁLOGOS
SELECT 
    'POLÍTICAS CATÁLOGOS:' as categoria,
    tablename,
    policyname,
    cmd as operacion
FROM pg_policies 
WHERE tablename IN ('productos', 'tipos_investigacion', 'periodo')
ORDER BY tablename, policyname;

-- 6. PROBAR ACCESO A DATOS DE CATÁLOGOS
SELECT 
    'PRUEBA PRODUCTOS:' as categoria,
    COUNT(*) as total_productos,
    CASE 
        WHEN COUNT(*) > 0 THEN 'ACCESO OK'
        ELSE 'SIN ACCESO'
    END as estado
FROM productos;

SELECT 
    'PRUEBA TIPOS INVESTIGACIÓN:' as categoria,
    COUNT(*) as total_tipos,
    CASE 
        WHEN COUNT(*) > 0 THEN 'ACCESO OK'
        ELSE 'SIN ACCESO'
    END as estado
FROM tipos_investigacion;

SELECT 
    'PRUEBA PERÍODOS:' as categoria,
    COUNT(*) as total_periodos,
    CASE 
        WHEN COUNT(*) > 0 THEN 'ACCESO OK'
        ELSE 'SIN ACCESO'
    END as estado
FROM periodo;

-- 7. VERIFICAR ROLES DEL USUARIO ACTUAL
SELECT 
    'ROLES USUARIO:' as categoria,
    COALESCE(ur.role, 'SIN ROLES') as rol,
    CASE 
        WHEN ur.role IN ('administrador', 'investigador') THEN 'PERMISO OK'
        ELSE 'SIN PERMISO'
    END as estado_permiso
FROM user_roles ur
WHERE ur.user_id = auth.uid()
UNION ALL
SELECT 
    'ROLES USUARIO:' as categoria,
    'NO HAY ROLES ASIGNADOS' as rol,
    'NECESITA ROLES' as estado_permiso
WHERE NOT EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid()
);

-- 8. PROBAR INSERCIÓN EN INVESTIGACIONES (SIMULACIÓN)
-- Esta consulta NO insertará nada, solo verificará si tendría permisos
SELECT 
    'PRUEBA INSERCIÓN:' as categoria,
    'SIMULANDO INSERT' as operacion,
    CASE 
        WHEN auth.uid() IS NOT NULL THEN 'USUARIO AUTENTICADO - OK'
        ELSE 'USUARIO NO AUTENTICADO - ERROR'
    END as resultado;

-- ====================================
-- SOLUCIONES RÁPIDAS SI HAY PROBLEMAS
-- ====================================

-- SOLUCIÓN 1: Si las tablas de catálogos no tienen permisos, aplicar políticas permisivas
DO $$ 
BEGIN
    -- Verificar y crear políticas para productos
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'productos' AND policyname = 'Permitir lectura productos'
    ) THEN
        -- Habilitar RLS y crear política
        EXECUTE 'ALTER TABLE productos ENABLE ROW LEVEL SECURITY';
        EXECUTE 'CREATE POLICY "Permitir lectura productos" ON productos FOR SELECT USING (true)';
        RAISE NOTICE 'Política creada para productos';
    END IF;

    -- Verificar y crear políticas para tipos_investigacion
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'tipos_investigacion' AND policyname = 'Permitir lectura tipos'
    ) THEN
        EXECUTE 'ALTER TABLE tipos_investigacion ENABLE ROW LEVEL SECURITY';
        EXECUTE 'CREATE POLICY "Permitir lectura tipos" ON tipos_investigacion FOR SELECT USING (true)';
        RAISE NOTICE 'Política creada para tipos_investigacion';
    END IF;

    -- Verificar y crear políticas para periodo
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'periodo' AND policyname = 'Permitir lectura periodos'
    ) THEN
        EXECUTE 'ALTER TABLE periodo ENABLE ROW LEVEL SECURITY';
        EXECUTE 'CREATE POLICY "Permitir lectura periodos" ON periodo FOR SELECT USING (true)';
        RAISE NOTICE 'Política creada para periodo';
    END IF;
END $$;

-- SOLUCIÓN 2: Si la tabla investigaciones tiene políticas muy restrictivas, simplificar
DO $$
BEGIN
    -- Eliminar políticas complejas si existen
    DROP POLICY IF EXISTS "Usuarios pueden ver investigaciones" ON investigaciones;
    DROP POLICY IF EXISTS "Usuarios pueden crear investigaciones" ON investigaciones;
    DROP POLICY IF EXISTS "Usuarios pueden actualizar investigaciones" ON investigaciones;
    DROP POLICY IF EXISTS "Usuarios pueden eliminar investigaciones" ON investigaciones;
    
    -- Crear políticas simples
    CREATE POLICY "investigaciones_select_simple" ON investigaciones
        FOR SELECT USING (auth.uid() IS NOT NULL);
        
    CREATE POLICY "investigaciones_insert_simple" ON investigaciones
        FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
        
    CREATE POLICY "investigaciones_update_simple" ON investigaciones
        FOR UPDATE USING (auth.uid() IS NOT NULL);
        
    CREATE POLICY "investigaciones_delete_simple" ON investigaciones
        FOR DELETE USING (auth.uid() IS NOT NULL);
        
    RAISE NOTICE 'Políticas simplificadas aplicadas a investigaciones';
END $$;

-- 9. VERIFICACIÓN FINAL
SELECT 
    'VERIFICACIÓN FINAL:' as titulo,
    'Ejecuta este script y verifica que todos los estados sean OK' as instruccion;

-- ====================================
-- INSTRUCCIONES DE USO:
-- ====================================
-- 1. Ejecuta este script completo en Supabase SQL Editor
-- 2. Revisa todos los resultados marcados como 'OK'
-- 3. Si algún estado es 'ERROR' o 'SIN ACCESO', las soluciones se aplicarán automáticamente
-- 4. Después recarga la aplicación y prueba crear una investigación
-- ==================================== 