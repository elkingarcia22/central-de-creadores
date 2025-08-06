-- Crear vista investigaciones_con_usuarios
-- Esta vista une investigaciones con usuarios_con_roles para tener toda la información en un solo lugar

-- Eliminar la vista si ya existe
DROP VIEW IF EXISTS investigaciones_con_usuarios;

-- Crear la vista con todos los datos necesarios
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

-- Verificar que la vista se creó correctamente
SELECT 'Vista investigaciones_con_usuarios creada exitosamente' as status;

-- Probar la vista con una consulta de ejemplo
SELECT 
    id,
    nombre,
    estado,
    responsable_nombre,
    responsable_email,
    implementador_nombre,
    implementador_email,
    creado_por_nombre,
    creado_por_email,
    creado_el
FROM investigaciones_con_usuarios 
ORDER BY creado_el DESC
LIMIT 5; 