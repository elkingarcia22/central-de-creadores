-- Verificar si existe la tabla roles_empresa
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'roles_empresa';

-- Si existe, mostrar su estructura
SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'roles_empresa' ORDER BY ordinal_position;

-- Si existe, mostrar algunos datos
SELECT * FROM roles_empresa LIMIT 10;
