-- ====================================
-- VERIFICAR TABLA PARTICIPANTES
-- ====================================
-- Ejecutar en Supabase SQL Editor

-- PASO 1: Verificar si la tabla participantes existe
SELECT '=== VERIFICAR TABLA PARTICIPANTES ===' as info;

SELECT 
    table_name,
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = table_name
    ) as existe
FROM (VALUES 
    ('participantes'),
    ('participantes_internos')
) as t(table_name);

-- PASO 2: Verificar estructura de participantes
SELECT '=== ESTRUCTURA DE PARTICIPANTES ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'participantes' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- PASO 3: Verificar datos en participantes
SELECT '=== DATOS EN PARTICIPANTES ===' as info;

SELECT COUNT(*) as total_participantes
FROM participantes;

SELECT id, nombre, email, activo
FROM participantes 
WHERE activo = true
ORDER BY nombre
LIMIT 10;

-- PASO 4: Verificar RLS en participantes
SELECT '=== RLS EN PARTICIPANTES ===' as info;

SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_habilitado
FROM pg_tables 
WHERE tablename = 'participantes';

-- PASO 5: Deshabilitar RLS si está habilitado
SELECT '=== DESHABILITANDO RLS PARTICIPANTES ===' as info;

ALTER TABLE participantes DISABLE ROW LEVEL SECURITY;

SELECT '✅ RLS deshabilitado en participantes' as resultado;

-- PASO 6: Crear participantes de prueba si no hay
DO $$
BEGIN
    IF (SELECT COUNT(*) FROM participantes) = 0 THEN
        RAISE NOTICE 'Creando participantes de prueba...';
        
        INSERT INTO participantes (id, nombre, email, activo, created_at, updated_at) VALUES
        (gen_random_uuid(), 'Participante Externo 1', 'externo1@empresa.com', true, NOW(), NOW()),
        (gen_random_uuid(), 'Participante Externo 2', 'externo2@empresa.com', true, NOW(), NOW()),
        (gen_random_uuid(), 'Participante Externo 3', 'externo3@empresa.com', true, NOW(), NOW()),
        (gen_random_uuid(), 'Participante Externo 4', 'externo4@empresa.com', true, NOW(), NOW()),
        (gen_random_uuid(), 'Participante Externo 5', 'externo5@empresa.com', true, NOW(), NOW());
        
        RAISE NOTICE '✅ Participantes externos creados exitosamente';
    ELSE
        RAISE NOTICE '✅ Ya existen participantes externos';
    END IF;
END $$;

-- PASO 7: Verificar datos finales
SELECT '=== VERIFICACIÓN FINAL ===' as info;

SELECT 
    'Participantes externos:' as tipo, COUNT(*) as total
FROM participantes 
WHERE activo = true
UNION ALL
SELECT 
    'Participantes internos:' as tipo, COUNT(*) as total
FROM participantes_internos 
WHERE activo = true; 