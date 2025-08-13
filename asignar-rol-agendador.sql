-- ====================================
-- ASIGNAR ROL AGENDADOR A USUARIOS
-- ====================================

-- 1. OBTENER EL ID DEL ROL AGENDADOR (reemplazar con el UUID real)
-- SET @rol_agendador_id = (SELECT id FROM roles_plataforma WHERE nombre = 'Agendador');

-- 2. ASIGNAR ROL AGENDADOR A UN USUARIO ESPECÍFICO
-- INSERT INTO user_roles (user_id, role_id, creado_el, actualizado_el)
-- VALUES (
--   'UUID_DEL_USUARIO', -- Reemplazar con el UUID del usuario
--   @rol_agendador_id,
--   NOW(),
--   NOW()
-- );

-- 3. ASIGNAR ROL AGENDADOR A MÚLTIPLES USUARIOS POR EMAIL
-- INSERT INTO user_roles (user_id, role_id, creado_el, actualizado_el)
-- SELECT 
--   p.id as user_id,
--   rp.id as role_id,
--   NOW() as creado_el,
--   NOW() as actualizado_el
-- FROM profiles p
-- CROSS JOIN roles_plataforma rp
-- WHERE p.email IN ('usuario1@ejemplo.com', 'usuario2@ejemplo.com')
--   AND rp.nombre = 'Agendador'
--   AND NOT EXISTS (
--     SELECT 1 FROM user_roles ur 
--     WHERE ur.user_id = p.id AND ur.role_id = rp.id
--   );

-- 4. VERIFICAR USUARIOS CON ROL AGENDADOR
SELECT 
  p.id,
  p.full_name,
  p.email,
  rp.nombre as rol,
  ur.creado_el as fecha_asignacion
FROM user_roles ur
JOIN profiles p ON ur.user_id = p.id
JOIN roles_plataforma rp ON ur.role_id = rp.id
WHERE rp.nombre = 'Agendador'
ORDER BY ur.creado_el DESC;

-- 5. ASIGNAR RECLUTAMIENTOS A AGENDADORES
-- UPDATE reclutamientos 
-- SET responsable_agendamiento = 'UUID_DEL_AGENDADOR'
-- WHERE id = 'UUID_DEL_RECLUTAMIENTO';

-- 6. VERIFICAR RECLUTAMIENTOS ASIGNADOS A AGENDADORES
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
ORDER BY r.creado_el DESC;
