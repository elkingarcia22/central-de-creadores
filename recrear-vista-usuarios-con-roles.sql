-- ====================================
-- RECREAR VISTA usuarios_con_roles BASADA EN TABLA usuarios
-- ====================================

-- 1. Eliminar la vista actual
DROP VIEW IF EXISTS usuarios_con_roles;

-- 2. Crear nueva vista basada en usuarios (fuente única de verdad)
CREATE VIEW usuarios_con_roles AS
SELECT 
    u.id,
    u.nombre as full_name,
    u.correo as email,
    u.foto_url as avatar_url,
    NOW() as created_at,
    NOW() as updated_at,
    CASE
        WHEN (count(ur.role) > 0) THEN array_agg((ur.role)::text)
        ELSE '{}'::text[]
    END AS roles
FROM usuarios u
LEFT JOIN user_roles ur ON u.id = ur.user_id
WHERE u.activo = true
GROUP BY u.id, u.nombre, u.correo, u.foto_url;

-- 3. Verificar que la vista funciona correctamente
SELECT 
    'Vista recreada exitosamente' as estado,
    COUNT(*) as total_usuarios_en_vista 
FROM usuarios_con_roles;

-- 4. Mostrar algunos usuarios de la nueva vista
SELECT 
    id,
    full_name,
    email,
    roles
FROM usuarios_con_roles 
ORDER BY full_name 
LIMIT 5;

-- 5. Verificar que no hay inconsistencias
SELECT 
    'Verificación de consistencia' as tipo,
    COUNT(*) as total_usuarios_activos
FROM usuarios 
WHERE activo = true
UNION ALL
SELECT 
    'Usuarios en vista' as tipo,
    COUNT(*) as total
FROM usuarios_con_roles;
