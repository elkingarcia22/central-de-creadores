-- ====================================
-- VERIFICAR ESTADO DEPARTAMENTOS EN SUPABASE
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar si existe la tabla departamentos
SELECT '1. Verificando si existe tabla departamentos:' as info;
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'departamentos'
) as tabla_existe;

-- 2. Si existe, mostrar estructura
SELECT '2. Estructura de tabla departamentos (si existe):' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'departamentos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar si hay datos en departamentos
SELECT '3. Total de departamentos (si existe tabla):' as info;
SELECT COUNT(*) as total_departamentos
FROM departamentos;

-- 4. Mostrar algunos departamentos de ejemplo
SELECT '4. Departamentos de ejemplo (si existen):' as info;
SELECT id, nombre, categoria, orden, activo
FROM departamentos 
ORDER BY orden, nombre
LIMIT 10;

-- 5. Verificar estructura de participantes_internos
SELECT '5. Estructura de tabla participantes_internos:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'participantes_internos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. Verificar si existe la columna departamento_id
SELECT '6. Verificando columna departamento_id en participantes_internos:' as info;
SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'participantes_internos'
    AND column_name = 'departamento_id'
) as columna_departamento_id_existe;

-- 7. Verificar políticas RLS de departamentos
SELECT '7. Políticas RLS de departamentos:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'departamentos';

-- 8. Verificar índices de departamentos
SELECT '8. Índices de tabla departamentos:' as info;
SELECT indexname, indexdef
FROM pg_indexes 
WHERE tablename = 'departamentos';

-- 9. Verificar foreign key de participantes_internos
SELECT '9. Foreign keys de participantes_internos:' as info;
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
AND tc.table_name='participantes_internos';

-- 10. Verificar datos de participantes_internos
SELECT '10. Datos de participantes_internos:' as info;
SELECT id, nombre, email, departamento_id, created_at
FROM participantes_internos 
ORDER BY created_at DESC
LIMIT 5;

-- 11. Verificar si hay errores de constraint
SELECT '11. Verificando constraints únicos:' as info;
SELECT conname, contype, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'departamentos'::regclass;

-- 12. Estado general del sistema
SELECT '12. Estado general del sistema:' as info;
SELECT 
    'departamentos' as tabla,
    (SELECT COUNT(*) FROM departamentos) as total_registros,
    (SELECT COUNT(*) FROM departamentos WHERE activo = true) as activos
UNION ALL
SELECT 
    'participantes_internos' as tabla,
    (SELECT COUNT(*) FROM participantes_internos) as total_registros,
    (SELECT COUNT(*) FROM participantes_internos WHERE departamento_id IS NOT NULL) as con_departamento; 