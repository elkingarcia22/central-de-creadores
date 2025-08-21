-- ====================================
-- VERIFICAR ESTRUCTURA EXACTA DE LA VISTA
-- ====================================

-- 1. Verificar todas las columnas de la vista actual
SELECT 
    column_name,
    data_type,
    is_nullable,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'vista_reclutamientos_completa'
ORDER BY ordinal_position;

-- 2. Verificar la definición de la vista
SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views 
WHERE viewname = 'vista_reclutamientos_completa';

-- 3. Verificar datos de ejemplo de la vista actual
SELECT * FROM vista_reclutamientos_completa LIMIT 1;
