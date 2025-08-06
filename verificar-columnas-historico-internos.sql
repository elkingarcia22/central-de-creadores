-- Verificar columnas de historial_participacion_participantes_internos

-- 1. VER TODAS LAS COLUMNAS
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'historial_participacion_participantes_internos'
ORDER BY ordinal_position;

-- 2. VER EJEMPLO DE DATOS (SI HAY)
SELECT *
FROM historial_participacion_participantes_internos 
LIMIT 3;

-- 3. VER CUÁNTOS REGISTROS HAY
SELECT 
    'TOTAL REGISTROS' as fuente,
    COUNT(*) as total
FROM historial_participacion_participantes_internos; 