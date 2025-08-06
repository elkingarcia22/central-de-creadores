-- Script para actualizar el rol del participante friend & family
-- Basado en los logs, el participante ID es: a0c3872b-ecd2-4479-9320-41d73b1c98ca

-- Primero, verificar el estado actual
SELECT 
    id,
    nombre,
    email,
    departamento_id,
    rol_empresa_id
FROM participantes_friend_family 
WHERE id = 'a0c3872b-ecd2-4479-9320-41d73b1c98ca';

-- Verificar qué roles están disponibles
SELECT id, nombre FROM roles_empresa LIMIT 10;

-- Actualizar el rol (ejemplo: usar el primer rol disponible)
-- Primero obtener un rol_id válido
UPDATE participantes_friend_family 
SET rol_empresa_id = (
    SELECT id FROM roles_empresa LIMIT 1
)
WHERE id = 'a0c3872b-ecd2-4479-9320-41d73b1c98ca';

-- Verificar el cambio
SELECT 
    p.id,
    p.nombre,
    p.email,
    p.departamento_id,
    p.rol_empresa_id,
    r.nombre as rol_nombre
FROM participantes_friend_family p
LEFT JOIN roles_empresa r ON p.rol_empresa_id = r.id
WHERE p.id = 'a0c3872b-ecd2-4479-9320-41d73b1c98ca'; 