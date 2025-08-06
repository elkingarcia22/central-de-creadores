-- Solucionar JOINs entre investigaciones y usuarios
-- Ejecutar después de verificar con verificar-foreign-keys-investigaciones.sql

-- =====================================================
-- OPCIÓN 1: Si las FK apuntan a 'usuarios' pero queremos usar 'profiles'
-- =====================================================

-- 1A. Eliminar foreign keys existentes (si apuntan a tabla incorrecta)
-- ALTER TABLE investigaciones DROP CONSTRAINT IF EXISTS investigaciones_responsable_id_fkey;
-- ALTER TABLE investigaciones DROP CONSTRAINT IF EXISTS investigaciones_implementador_id_fkey;
-- ALTER TABLE investigaciones DROP CONSTRAINT IF EXISTS investigaciones_creado_por_fkey;

-- 1B. Crear nuevas foreign keys apuntando a profiles
-- ALTER TABLE investigaciones 
-- ADD CONSTRAINT investigaciones_responsable_id_fkey 
-- FOREIGN KEY (responsable_id) REFERENCES profiles(id);

-- ALTER TABLE investigaciones 
-- ADD CONSTRAINT investigaciones_implementador_id_fkey 
-- FOREIGN KEY (implementador_id) REFERENCES profiles(id);

-- ALTER TABLE investigaciones 
-- ADD CONSTRAINT investigaciones_creado_por_fkey 
-- FOREIGN KEY (creado_por) REFERENCES profiles(id);

-- =====================================================
-- OPCIÓN 2: Crear vista especializada para investigaciones con usuarios
-- =====================================================

-- 2A. Crear vista que une investigaciones con usuarios_con_roles
DROP VIEW IF EXISTS investigaciones_con_usuarios;

CREATE VIEW investigaciones_con_usuarios AS
SELECT 
    i.*,
    -- Datos del responsable
    r.full_name as responsable_nombre,
    r.email as responsable_email,
    r.avatar_url as responsable_avatar,
    r.roles as responsable_roles,
    -- Datos del implementador
    imp.full_name as implementador_nombre,
    imp.email as implementador_email,
    imp.avatar_url as implementador_avatar,
    imp.roles as implementador_roles,
    -- Datos del creador
    c.full_name as creado_por_nombre,
    c.email as creado_por_email,
    c.avatar_url as creado_por_avatar,
    c.roles as creado_por_roles
FROM investigaciones i
LEFT JOIN usuarios_con_roles r ON i.responsable_id = r.id
LEFT JOIN usuarios_con_roles imp ON i.implementador_id = imp.id
LEFT JOIN usuarios_con_roles c ON i.creado_por = c.id;

-- =====================================================
-- OPCIÓN 3: Crear función para obtener datos de usuario
-- =====================================================

-- 3A. Función que obtiene datos de usuario desde usuarios_con_roles
CREATE OR REPLACE FUNCTION get_usuario_info(user_id uuid)
RETURNS TABLE(
    full_name text,
    email text,
    avatar_url text,
    roles text[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.full_name,
        u.email,
        u.avatar_url,
        u.roles
    FROM usuarios_con_roles u
    WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PRUEBAS
-- =====================================================

-- Probar la vista investigaciones_con_usuarios
SELECT 
    id,
    nombre,
    responsable_nombre,
    responsable_email,
    implementador_nombre,
    implementador_email,
    creado_por_nombre,
    creado_por_email
FROM investigaciones_con_usuarios 
LIMIT 3;

-- Probar la función get_usuario_info
-- SELECT * FROM get_usuario_info('uuid-del-usuario-aqui');

-- =====================================================
-- RECOMENDACIÓN DE USO
-- =====================================================

-- Si usas OPCIÓN 2 (vista), en tu código TypeScript cambiarías:
-- .from('investigaciones') por .from('investigaciones_con_usuarios')
-- y no necesitarías hacer JOINs manuales

-- Si usas OPCIÓN 3 (función), mantienes las consultas actuales
-- pero los JOINs automáticos funcionarán mejor 
-- Agregar campo de trazabilidad si no existe
ALTER TABLE investigaciones ADD COLUMN IF NOT EXISTS seguimiento_origen_id UUID; 