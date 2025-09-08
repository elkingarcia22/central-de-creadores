-- ====================================
-- VERIFICAR TABLA SESIONES ESPECÍFICAMENTE
-- ====================================

-- Verificar si la tabla sesiones existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'sesiones'
) as tabla_sesiones_existe;

-- Verificar todas las tablas que contengan 'sesion' en el nombre
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name ILIKE '%sesion%'
ORDER BY table_name;

-- Verificar todas las tablas que contengan 'reclutamiento' en el nombre
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name ILIKE '%reclutamiento%'
ORDER BY table_name;

-- Verificar todas las tablas que contengan 'participante' en el nombre
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name ILIKE '%participante%'
ORDER BY table_name;

-- Verificar todas las tablas en el esquema public
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
