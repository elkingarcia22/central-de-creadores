-- Verificar la estructura de la tabla participantes (principal)
SELECT 'participantes' as tabla, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'participantes' 
ORDER BY ordinal_position;

-- Verificar la estructura de la tabla participantes_internos
SELECT 'participantes_internos' as tabla, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'participantes_internos' 
ORDER BY ordinal_position;

-- Verificar si participantes_internos es una vista
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_name IN ('participantes', 'participantes_internos');

-- Verificar la relación entre reclutamientos y participantes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'reclutamientos' 
AND column_name LIKE '%participante%'
ORDER BY ordinal_position; 