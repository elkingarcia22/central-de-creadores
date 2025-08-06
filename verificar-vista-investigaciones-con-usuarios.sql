-- Verificar si existe la vista investigaciones_con_usuarios
SELECT schemaname, viewname, definition 
FROM pg_views 
WHERE viewname = 'investigaciones_con_usuarios';

-- Si no existe, verificar si existe la tabla investigaciones
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'investigaciones'
ORDER BY ordinal_position;

-- Verificar si hay datos en la tabla investigaciones
SELECT COUNT(*) as total_investigaciones FROM investigaciones;

-- Mostrar algunas investigaciones de ejemplo
SELECT id, nombre, estado, creado_el 
FROM investigaciones 
LIMIT 5; 