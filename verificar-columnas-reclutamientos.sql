-- ====================================
-- VERIFICAR COLUMNAS EXACTAS DE RECLUTAMIENTOS
-- ====================================

-- Verificar estructura de la tabla reclutamientos
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'reclutamientos'
ORDER BY ordinal_position;

-- Verificar si hay datos en la tabla
SELECT COUNT(*) as total_reclutamientos FROM reclutamientos;

-- Verificar algunos registros de ejemplo (solo las columnas que existen)
SELECT * FROM reclutamientos LIMIT 3;