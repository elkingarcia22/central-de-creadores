-- ====================================
-- LIMPIAR FOREIGN KEYS DUPLICADOS
-- ====================================
-- Ejecutar en el SQL Editor de Supabase
-- Este script elimina foreign keys duplicados

-- PASO 1: Verificar foreign keys existentes
SELECT 'PASO 1: Verificando foreign keys existentes...' as info;

SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name='participantes_internos'
AND kcu.column_name = 'departamento_id';

-- PASO 2: Eliminar foreign key duplicado
SELECT 'PASO 2: Eliminando foreign key duplicado...' as info;

-- Eliminar el foreign key automático (el que no creamos nosotros)
ALTER TABLE participantes_internos 
DROP CONSTRAINT IF EXISTS participantes_internos_departamento_id_fkey;

SELECT '✅ Foreign key duplicado eliminado' as resultado;

-- PASO 3: Verificar que solo queda uno
SELECT 'PASO 3: Verificando foreign keys finales...' as info;

SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name='participantes_internos'
AND kcu.column_name = 'departamento_id';

-- PASO 4: Verificar que la tabla departamentos existe y tiene datos
SELECT 'PASO 4: Verificando tabla departamentos...' as info;

SELECT '¿Existe tabla departamentos?' as pregunta;
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'departamentos'
) as tabla_existe;

SELECT 'Total de departamentos:' as info;
SELECT COUNT(*) as total_departamentos
FROM departamentos 
WHERE activo = true;

-- PASO 5: Verificar algunos departamentos
SELECT 'PASO 5: Departamentos de ejemplo...' as info;
SELECT id, nombre, categoria, orden
FROM departamentos 
ORDER BY orden, nombre
LIMIT 10;

SELECT '🎉 LIMPIEZA DE FOREIGN KEYS COMPLETADA' as resultado_final; 