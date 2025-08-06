-- Verificar estructura real de estado_agendamiento_cat
-- Ejecuta este script y pásame el resultado JSON

-- 1. Ver estructura de columnas
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'estado_agendamiento_cat' 
ORDER BY ordinal_position;

-- 2. Ver datos de ejemplo
SELECT 
    id,
    nombre,
    descripcion,
    activo,
    orden,
    creado_en
FROM estado_agendamiento_cat
ORDER BY orden;

-- 3. Verificar si hay columnas de color
SELECT 
    column_name
FROM information_schema.columns 
WHERE table_name = 'estado_agendamiento_cat' 
AND column_name LIKE '%color%';

-- 4. Ver estructura completa (sin \d)
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'estado_agendamiento_cat'
ORDER BY ordinal_position; 