-- ====================================
-- IMPLEMENTACIÓN COMPLETA DEL ROL AGENDADOR
-- ====================================
-- EJECUTAR ESTOS COMANDOS EN ORDEN EN SUPABASE SQL EDITOR

-- PASO 1: CREAR EL ROL AGENDADOR
INSERT INTO roles_plataforma (id, nombre, descripcion, activo, creado_el, actualizado_el)
VALUES (
  gen_random_uuid(),
  'Agendador',
  'Rol especializado en la gestión de agendamientos de reclutamientos. Solo puede ver y editar reclutamientos donde es responsable del agendamiento.',
  true,
  NOW(),
  NOW()
);

-- PASO 2: OBTENER EL UUID DEL ROL AGENDADOR (GUARDAR ESTE UUID)
SELECT 
  id,
  nombre,
  descripcion
FROM roles_plataforma 
WHERE nombre = 'Agendador'
ORDER BY creado_el DESC
LIMIT 1;

-- PASO 3: VERIFICAR QUE LA TABLA reclutamientos TIENE EL CAMPO responsable_agendamiento
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'reclutamientos' 
  AND column_name = 'responsable_agendamiento';

-- PASO 4: SI NO EXISTE responsable_agendamiento, CREARLO (descomentar si es necesario)
-- ALTER TABLE reclutamientos 
-- ADD COLUMN responsable_agendamiento UUID REFERENCES auth.users(id);

-- PASO 5: CREAR ÍNDICE PARA OPTIMIZAR CONSULTAS (descomentar si es necesario)
-- CREATE INDEX IF NOT EXISTS idx_reclutamientos_responsable_agendamiento 
-- ON reclutamientos(responsable_agendamiento);

-- PASO 6: ASIGNAR ROL AGENDADOR A UN USUARIO (reemplazar UUIDs)
-- INSERT INTO user_roles (user_id, role_id, creado_el, actualizado_el)
-- VALUES (
--   'UUID_DEL_USUARIO', -- Reemplazar con el UUID del usuario
--   'UUID_DEL_ROL_AGENDADOR', -- Reemplazar con el UUID del rol obtenido en PASO 2
--   NOW(),
--   NOW()
-- );

-- PASO 7: ASIGNAR RECLUTAMIENTOS A AGENDADORES (reemplazar UUIDs)
-- UPDATE reclutamientos 
-- SET responsable_agendamiento = 'UUID_DEL_AGENDADOR'
-- WHERE id = 'UUID_DEL_RECLUTAMIENTO';

-- PASO 8: VERIFICAR IMPLEMENTACIÓN
SELECT 
  'Roles disponibles' as verificacion,
  COUNT(*) as cantidad
FROM roles_plataforma 
WHERE nombre = 'Agendador'

UNION ALL

SELECT 
  'Usuarios con rol agendador' as verificacion,
  COUNT(DISTINCT ur.user_id) as cantidad
FROM user_roles ur
JOIN roles_plataforma rp ON ur.role_id = rp.id
WHERE rp.nombre = 'Agendador'

UNION ALL

SELECT 
  'Reclutamientos con agendador asignado' as verificacion,
  COUNT(*) as cantidad
FROM reclutamientos 
WHERE responsable_agendamiento IS NOT NULL;

-- PASO 9: VERIFICAR USUARIOS AGENDADORES Y SUS ASIGNACIONES
SELECT 
  p.full_name,
  p.email,
  COUNT(r.id) as reclutamientos_asignados
FROM profiles p
JOIN user_roles ur ON p.id = ur.user_id
JOIN roles_plataforma rp ON ur.role_id = rp.id
LEFT JOIN reclutamientos r ON p.id = r.responsable_agendamiento
WHERE rp.nombre = 'Agendador'
GROUP BY p.id, p.full_name, p.email
ORDER BY reclutamientos_asignados DESC;
