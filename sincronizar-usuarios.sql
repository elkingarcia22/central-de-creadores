-- ====================================
-- SCRIPT DE SINCRONIZACIÓN DE USUARIOS
-- ====================================

-- Opción 1: Sincronizar usuarios desde profiles hacia usuarios
-- (Si profiles es la fuente de verdad)

-- Insertar usuarios que están en profiles pero no en usuarios
INSERT INTO usuarios (id, nombre, correo, activo, rol_plataforma)
SELECT 
    p.id,
    p.full_name,
    p.email,
    true, -- activo por defecto
    '[]'::jsonb -- rol_plataforma vacío por defecto
FROM profiles p
LEFT JOIN usuarios u ON p.id = u.id
WHERE u.id IS NULL;

-- Actualizar usuarios existentes con datos de profiles
UPDATE usuarios 
SET 
    nombre = p.full_name,
    correo = p.email
FROM profiles p
WHERE usuarios.id = p.id 
    AND (usuarios.nombre != p.full_name OR usuarios.correo != p.email);

-- Opción 2: Sincronizar profiles desde usuarios hacia profiles
-- (Si usuarios es la fuente de verdad)

-- Insertar usuarios que están en usuarios pero no en profiles
INSERT INTO profiles (id, full_name, email, created_at)
SELECT 
    u.id,
    u.nombre,
    u.correo,
    NOW()
FROM usuarios u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Actualizar profiles existentes con datos de usuarios
UPDATE profiles 
SET 
    full_name = u.nombre,
    email = u.correo
FROM usuarios u
WHERE profiles.id = u.id 
    AND (profiles.full_name != u.nombre OR profiles.email != u.correo);

-- Opción 3: Recrear la vista usuarios_con_roles para que use solo usuarios
-- (Recomendado si usuarios es la fuente de verdad)

-- Eliminar la vista actual
DROP VIEW IF EXISTS usuarios_con_roles;

-- Crear nueva vista basada solo en usuarios
CREATE VIEW usuarios_con_roles AS
SELECT 
    u.id,
    u.nombre as full_name,
    u.correo as email,
    u.foto_url as avatar_url,
    COALESCE(u.rol_plataforma, '[]'::jsonb) as roles,
    NOW() as created_at
FROM usuarios u
WHERE u.activo = true;

-- Verificar que la vista funciona correctamente
SELECT COUNT(*) as total_usuarios_en_vista FROM usuarios_con_roles;
