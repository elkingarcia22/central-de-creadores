-- ====================================
-- VERIFICAR ESTRUCTURA TABLAS PARTICIPANTES
-- ====================================

-- 1. Verificar estructura de la tabla participantes
SELECT 
    'Estructura tabla participantes' as tipo,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'participantes'
ORDER BY ordinal_position;

-- 2. Verificar estructura de la tabla participantes_internos
SELECT 
    'Estructura tabla participantes_internos' as tipo,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'participantes_internos'
ORDER BY ordinal_position;

-- 3. Verificar algunos datos de ejemplo de participantes
SELECT 
    'Datos ejemplo participantes' as tipo,
    id,
    nombre
FROM participantes 
LIMIT 1;

-- 4. Verificar algunos datos de ejemplo de participantes_internos
SELECT 
    'Datos ejemplo participantes_internos' as tipo,
    id,
    nombre
FROM participantes_internos 
LIMIT 1; 

-- Verificar la estructura real de la tabla participantes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'participantes' 
ORDER BY ordinal_position; 