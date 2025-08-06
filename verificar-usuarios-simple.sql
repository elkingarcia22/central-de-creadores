-- Verificar usuarios simple

-- 1. VER ESTRUCTURA DE LA TABLA USUARIOS
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'usuarios'
ORDER BY ordinal_position;

-- 2. VER EJEMPLO DE DATOS
SELECT *
FROM usuarios 
LIMIT 5;

-- 3. VER CUALQUIER USUARIO VÁLIDO
SELECT 
    'USUARIO VÁLIDO' as fuente,
    id
FROM usuarios 
LIMIT 1; 