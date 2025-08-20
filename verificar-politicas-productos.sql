-- ====================================
-- VERIFICAR Y AJUSTAR POLÍTICAS DE PRODUCTOS
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar productos existentes
SELECT 
    id,
    nombre,
    activo,
    creado_el
FROM productos 
ORDER BY nombre;

-- 2. Verificar políticas RLS actuales
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
WHERE tablename = 'productos';

-- 3. Verificar si RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'productos';

-- 4. Crear política para permitir lectura de productos activos
-- (Solo si no existe una política de lectura)
DO $$
BEGIN
    -- Verificar si ya existe una política de SELECT
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'productos' 
        AND cmd = 'SELECT'
    ) THEN
        -- Crear política de lectura para productos activos
        CREATE POLICY "productos_select_policy" ON productos
        FOR SELECT
        USING (activo = true);
        
        RAISE NOTICE 'Política de SELECT creada para productos';
    ELSE
        RAISE NOTICE 'Ya existe una política de SELECT para productos';
    END IF;
END $$;

-- 5. Crear política para permitir inserción (solo si no existe)
DO $$
BEGIN
    -- Verificar si ya existe una política de INSERT
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'productos' 
        AND cmd = 'INSERT'
    ) THEN
        -- Crear política de inserción
        CREATE POLICY "productos_insert_policy" ON productos
        FOR INSERT
        WITH CHECK (true);
        
        RAISE NOTICE 'Política de INSERT creada para productos';
    ELSE
        RAISE NOTICE 'Ya existe una política de INSERT para productos';
    END IF;
END $$;

-- 6. Verificar políticas después de los cambios
SELECT 
    policyname,
    cmd,
    permissive,
    roles,
    qual
FROM pg_policies 
WHERE tablename = 'productos'
ORDER BY cmd;

-- 7. Probar consulta de productos activos
SELECT 
    COUNT(*) as total_productos_activos,
    COUNT(CASE WHEN activo = true THEN 1 END) as productos_activos,
    COUNT(CASE WHEN activo = false THEN 1 END) as productos_inactivos
FROM productos;
