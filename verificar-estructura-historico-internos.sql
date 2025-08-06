-- Verificar estructura de historial_participacion_participantes_internos

-- 1. VER ESTRUCTURA DE LA TABLA
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'historial_participacion_participantes_internos'
ORDER BY ordinal_position;

-- 2. VER EJEMPLO DE DATOS
SELECT *
FROM historial_participacion_participantes_internos 
LIMIT 3;

-- 3. VER SI EXISTE LA TABLA
SELECT 
    'TABLA EXISTE' as fuente,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'historial_participacion_participantes_internos'; 