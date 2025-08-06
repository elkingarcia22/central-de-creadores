-- ====================================
-- VERIFICAR VISTAS DE RECLUTAMIENTO EXISTENTES
-- ====================================

-- 1. Verificar todas las vistas que contengan "reclutamiento" en el nombre
SELECT 
    'Vistas con reclutamiento' as tipo,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name LIKE '%reclutamiento%'
AND table_schema = 'public';

-- 2. Verificar todas las vistas en general
SELECT 
    'Todas las vistas' as tipo,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_type = 'VIEW'
AND table_schema = 'public'
ORDER BY table_name;

-- 3. Verificar si hay alguna vista que muestre datos de reclutamiento
SELECT 
    'Vistas que referencian reclutamientos' as tipo,
    table_name,
    view_definition
FROM information_schema.views 
WHERE view_definition LIKE '%reclutamiento%'
AND table_schema = 'public';

-- 4. Verificar la estructura de la tabla reclutamientos
SELECT 
    'Estructura tabla reclutamientos' as tipo,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'reclutamientos'
ORDER BY ordinal_position; 