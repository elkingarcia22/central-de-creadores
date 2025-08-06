-- Verificar estructura de la tabla historial_participacion_participantes
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'historial_participacion_participantes'
ORDER BY ordinal_position; 