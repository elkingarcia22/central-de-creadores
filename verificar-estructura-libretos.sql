-- Verificar qué tablas relacionadas con libretos existen
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%libreto%'
ORDER BY table_name;

-- Verificar todas las tablas que contengan 'libreto' en el nombre
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name LIKE '%libreto%' OR table_name LIKE '%libret%')
ORDER BY table_name;

-- Verificar la estructura de la tabla investigaciones para ver si tiene campo libreto
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'investigaciones'
AND column_name LIKE '%libreto%'
ORDER BY ordinal_position;

-- Verificar si hay alguna tabla que contenga información de participantes
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%participante%'
ORDER BY table_name;

-- Verificar la estructura de la tabla participantes si existe
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'participantes'
ORDER BY ordinal_position; 

-- Verificar la estructura de la tabla libretos_investigacion
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'libretos_investigacion' 
ORDER BY ordinal_position; 