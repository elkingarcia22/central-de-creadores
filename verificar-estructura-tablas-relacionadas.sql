-- Verificar la estructura de las tablas relacionadas
-- Verificar columnas de log_actividades_investigacion
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'log_actividades_investigacion' 
ORDER BY ordinal_position;

-- Verificar columnas de seguimientos_investigacion
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'seguimientos_investigacion' 
ORDER BY ordinal_position;

-- Verificar columnas de participantes_internos
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'participantes_internos' 
ORDER BY ordinal_position; 