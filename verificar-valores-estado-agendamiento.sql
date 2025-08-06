-- ====================================
-- VERIFICAR VALORES ESTADO AGENDAMIENTO
-- ====================================

-- Verificar si la tabla estado_agendamiento_cat existe
SELECT 
    'Tabla existe' as tipo,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'estado_agendamiento_cat'
AND table_schema = 'public';

-- Verificar la estructura de estado_agendamiento_cat
SELECT 
    'Estructura' as tipo,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'estado_agendamiento_cat'
ORDER BY ordinal_position;

-- Verificar los valores disponibles
SELECT 
    'Valores disponibles' as tipo,
    *
FROM estado_agendamiento_cat
LIMIT 5;

-- Verificar si hay algún reclutamiento existente para ver qué estado_agendamiento usan
SELECT 
    'Reclutamientos existentes' as tipo,
    id,
    investigacion_id,
    estado_agendamiento
FROM reclutamientos 
LIMIT 3; 