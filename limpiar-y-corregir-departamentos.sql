-- ====================================
-- LIMPIAR Y CORREGIR DEPARTAMENTOS
-- ====================================
-- Ejecutar en el SQL Editor de Supabase
-- Este script elimina el campo departamento (text) y usa solo departamento_id

-- PASO 1: Verificar estado antes de limpiar
SELECT 'PASO 1: Estado antes de limpiar...' as info;

SELECT 'Campos actuales en participantes_internos:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'participantes_internos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- PASO 2: Migrar datos del campo departamento (text) a departamento_id
SELECT 'PASO 2: Migrando datos de departamento (text) a departamento_id...' as info;

-- Mostrar datos antes de migrar
SELECT 'Datos antes de migrar:' as info;
SELECT 
    id,
    nombre,
    email,
    departamento as departamento_texto,
    departamento_id as departamento_uuid
FROM participantes_internos 
WHERE departamento IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;

-- Migrar datos: buscar departamento por nombre y asignar ID
UPDATE participantes_internos 
SET departamento_id = (
    SELECT d.id 
    FROM departamentos d 
    WHERE LOWER(d.nombre) = LOWER(participantes_internos.departamento)
    LIMIT 1
)
WHERE departamento IS NOT NULL 
AND departamento_id IS NULL;

-- Para los que no encontraron coincidencia, asignar "Otro"
UPDATE participantes_internos 
SET departamento_id = (
    SELECT id FROM departamentos WHERE nombre = 'Otro' LIMIT 1
)
WHERE departamento IS NOT NULL 
AND departamento_id IS NULL;

SELECT '✅ Datos migrados' as resultado;

-- PASO 3: Verificar migración
SELECT 'PASO 3: Verificando migración...' as info;

SELECT 'Datos después de migrar:' as info;
SELECT 
    pi.id,
    pi.nombre,
    pi.email,
    pi.departamento as texto_original,
    d.nombre as departamento_nuevo,
    d.categoria as categoria
FROM participantes_internos pi
LEFT JOIN departamentos d ON pi.departamento_id = d.id
ORDER BY pi.created_at DESC
LIMIT 10;

-- PASO 4: Eliminar el campo departamento (text)
SELECT 'PASO 4: Eliminando campo departamento (text)...' as info;

-- Eliminar el campo departamento (text)
ALTER TABLE participantes_internos DROP COLUMN IF EXISTS departamento;

SELECT '✅ Campo departamento (text) eliminado' as resultado;

-- PASO 5: Verificar estructura final
SELECT 'PASO 5: Verificando estructura final...' as info;

SELECT 'Estructura final de participantes_internos:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'participantes_internos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- PASO 6: Verificar foreign key
SELECT 'PASO 6: Verificando foreign key...' as info;

SELECT 'Foreign keys de participantes_internos:' as info;
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

-- PASO 7: Verificar datos finales
SELECT 'PASO 7: Verificando datos finales...' as info;

SELECT 'Datos finales (ejemplo):' as info;
SELECT 
    pi.id,
    pi.nombre,
    pi.email,
    d.nombre as departamento,
    d.categoria as categoria,
    pi.created_at
FROM participantes_internos pi
LEFT JOIN departamentos d ON pi.departamento_id = d.id
ORDER BY pi.created_at DESC
LIMIT 10;

-- PASO 8: Contadores finales
SELECT 'PASO 8: Contadores finales...' as info;

SELECT 
    'participantes_internos' as tabla,
    COUNT(*) as total_registros
FROM participantes_internos
UNION ALL
SELECT 
    'participantes_con_departamento_id' as tabla,
    COUNT(*) as total_registros
FROM participantes_internos
WHERE departamento_id IS NOT NULL
UNION ALL
SELECT 
    'departamentos' as tabla,
    COUNT(*) as total_registros
FROM departamentos;

SELECT '🎉 LIMPIEZA Y CORRECCIÓN COMPLETADA' as resultado_final; 