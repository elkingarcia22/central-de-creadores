-- Verificar estructura de usuarios

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
LIMIT 3;

-- 3. VER USUARIOS CON ROLES
SELECT 
    u.id,
    ur.rol
FROM usuarios u
JOIN usuarios_roles ur ON u.id = ur.usuario_id
LIMIT 5; 