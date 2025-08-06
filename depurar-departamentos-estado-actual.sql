-- ====================================
-- DEPURAR DEPARTAMENTOS - ESTADO ACTUAL
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar estructura actual de participantes_internos
SELECT '1. Estructura actual de participantes_internos:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'participantes_internos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar si existe tabla departamentos
SELECT '2. ¿Existe tabla departamentos?' as info;
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'departamentos'
) as tabla_existe;

-- 3. Verificar datos actuales en participantes_internos
SELECT '3. Datos actuales en participantes_internos:' as info;
SELECT 
    id,
    nombre,
    email,
    departamento as departamento_texto,
    departamento_id as departamento_uuid,
    created_at
FROM participantes_internos 
ORDER BY created_at DESC
LIMIT 10;

-- 4. Verificar si hay datos en departamentos
SELECT '4. Datos en tabla departamentos:' as info;
SELECT COUNT(*) as total_departamentos FROM departamentos;

-- 5. Verificar foreign key
SELECT '5. Foreign keys de participantes_internos:' as info;
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

-- 6. Verificar algunos departamentos de ejemplo
SELECT '6. Departamentos de ejemplo:' as info;
SELECT id, nombre, categoria, orden
FROM departamentos 
ORDER BY orden, nombre
LIMIT 10;

-- 7. Verificar relación entre campos
SELECT '7. Relación entre campos departamento:' as info;
SELECT 
    pi.id,
    pi.nombre,
    pi.departamento as texto_actual,
    d.nombre as departamento_nombre,
    d.categoria as departamento_categoria
FROM participantes_internos pi
LEFT JOIN departamentos d ON pi.departamento_id = d.id
ORDER BY pi.created_at DESC
LIMIT 5; 