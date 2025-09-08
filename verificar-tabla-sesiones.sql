-- ====================================
-- VERIFICAR ESTRUCTURA DE TABLA SESIONES
-- ====================================

-- Verificar si la tabla sesiones existe
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'sesiones'
ORDER BY ordinal_position;

-- Verificar si hay datos en la tabla
SELECT COUNT(*) as total_sesiones FROM sesiones;

-- Verificar estructura de la tabla investigaciones
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'investigaciones'
ORDER BY ordinal_position;

-- Verificar si hay datos en investigaciones
SELECT COUNT(*) as total_investigaciones FROM investigaciones;
