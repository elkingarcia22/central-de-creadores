-- ====================================
-- ASIGNAR ROL AGENDADOR A USUARIOS
-- ====================================
-- BASADO EN LA ESTRUCTURA REAL DE LA BASE DE DATOS

-- PASO 1: OBTENER EL UUID DEL ROL AGENDADOR (reemplazar con el UUID obtenido)
-- SELECT id FROM roles_plataforma WHERE nombre = 'Agendador';

-- PASO 2: ASIGNAR ROL AGENDADOR A UN USUARIO ESPECÍFICO
-- INSERT INTO user_roles (user_id, role, created_at, updated_at)
-- VALUES (
--   'UUID_DEL_USUARIO', -- Reemplazar con el UUID del usuario
--   'UUID_DEL_ROL_AGENDADOR', -- Reemplazar con el UUID del rol obtenido
--   NOW(),
--   NOW()
-- );

-- PASO 3: ASIGNAR ROL AGENDADOR A MÚLTIPLES USUARIOS POR EMAIL
-- INSERT INTO user_roles (user_id, role, created_at, updated_at)
-- SELECT 
--   p.id as user_id,
--   rp.id as role,
--   NOW() as created_at,
--   NOW() as updated_at
-- FROM profiles p
-- CROSS JOIN roles_plataforma rp
-- WHERE p.email IN ('usuario1@ejemplo.com', 'usuario2@ejemplo.com')
--   AND rp.nombre = 'Agendador'
--   AND NOT EXISTS (
--     SELECT 1 FROM user_roles ur 
--     WHERE ur.user_id = p.id AND ur.role = rp.id
--   );

-- PASO 4: VERIFICAR USUARIOS CON ROL AGENDADOR
SELECT 
  p.id,
  p.full_name,
  p.email,
  rp.nombre as rol,
  ur.created_at as fecha_asignacion
FROM user_roles ur
JOIN profiles p ON ur.user_id = p.id
JOIN roles_plataforma rp ON ur.role = rp.id
WHERE rp.nombre = 'Agendador'
ORDER BY ur.created_at DESC;

-- PASO 5: ASIGNAR RECLUTAMIENTOS A AGENDADORES
-- UPDATE reclutamientos 
-- SET responsable_agendamiento = 'UUID_DEL_AGENDADOR'
-- WHERE id = 'UUID_DEL_RECLUTAMIENTO';

-- PASO 6: VERIFICAR RECLUTAMIENTOS ASIGNADOS A AGENDADORES
SELECT 
  r.id as reclutamiento_id,
  r.responsable_agendamiento,
  p.full_name as agendador_nombre,
  p.email as agendador_email,
  i.nombre as investigacion_nombre
FROM reclutamientos r
LEFT JOIN profiles p ON r.responsable_agendamiento = p.id
LEFT JOIN investigaciones i ON r.investigacion_id = i.id
WHERE r.responsable_agendamiento IS NOT NULL
ORDER BY r.updated_at DESC;
