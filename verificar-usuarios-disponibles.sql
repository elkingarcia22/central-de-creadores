-- Verificar usuarios disponibles

-- 1. VER USUARIOS DISPONIBLES
SELECT 
    id,
    email,
    nombre,
    apellido
FROM usuarios 
LIMIT 5;

-- 2. VER USUARIOS CON ROL RECLUTADOR
SELECT 
    u.id,
    u.email,
    u.nombre,
    u.apellido,
    ur.rol
FROM usuarios u
JOIN usuarios_roles ur ON u.id = ur.usuario_id
WHERE ur.rol = 'reclutador'
LIMIT 5;

-- 3. VER CUALQUIER USUARIO VÁLIDO
SELECT 
    'USUARIO VÁLIDO' as fuente,
    id,
    email
FROM usuarios 
LIMIT 1; 