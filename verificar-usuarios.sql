-- VERIFICAR USUARIOS EN LA BASE DE DATOS
-- Script para diagnosticar por qué la API /api/usuarios devuelve array vacío

-- 1. Verificar si la tabla usuarios existe
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'usuarios';

-- 2. Verificar la estructura de la tabla usuarios
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'usuarios'
ORDER BY ordinal_position;

-- 3. Contar usuarios en la tabla
SELECT COUNT(*) as total_usuarios FROM usuarios;

-- 4. Verificar si hay usuarios con datos
SELECT 
    id,
    email,
    full_name,
    created_at,
    updated_at
FROM usuarios 
LIMIT 10;

-- 5. Verificar si hay usuarios con roles
SELECT 
    u.id,
    u.email,
    u.full_name,
    ur.role_id,
    r.name as role_name
FROM usuarios u
LEFT JOIN usuarios_roles ur ON u.id = ur.usuario_id
LEFT JOIN roles r ON ur.role_id = r.id
LIMIT 10;

-- 6. Verificar roles disponibles
SELECT 
    id,
    name,
    description,
    created_at
FROM roles
ORDER BY name;

-- 7. Verificar si hay usuarios con roles de reclutador o administrador
SELECT 
    u.id,
    u.email,
    u.full_name,
    r.name as role_name
FROM usuarios u
JOIN usuarios_roles ur ON u.id = ur.usuario_id
JOIN roles r ON ur.role_id = r.id
WHERE LOWER(r.name) LIKE '%reclutador%' 
   OR LOWER(r.name) LIKE '%administrador%'
   OR LOWER(r.name) LIKE '%admin%'
ORDER BY r.name, u.full_name;
