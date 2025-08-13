-- ====================================
-- VERIFICACIÓN Y LIMPIEZA DE DATOS
-- ====================================

-- 1. VERIFICAR TODOS LOS ROLES DISPONIBLES
SELECT 
  id,
  nombre,
  descripcion,
  activo,
  creado_el
FROM roles_plataforma 
ORDER BY nombre;

-- 2. VERIFICAR USUARIOS Y SUS ROLES
SELECT 
  p.id,
  p.full_name,
  p.email,
  array_agg(rp.nombre) as roles,
  array_agg(ur.creado_el) as fechas_asignacion
FROM profiles p
LEFT JOIN user_roles ur ON p.id = ur.user_id
LEFT JOIN roles_plataforma rp ON ur.role_id = rp.id
GROUP BY p.id, p.full_name, p.email
ORDER BY p.full_name;

-- 3. VERIFICAR RECLUTAMIENTOS SIN RESPONSABLE DE AGENDAMIENTO
SELECT 
  r.id,
  r.investigacion_id,
  i.nombre as investigacion_nombre,
  r.responsable_agendamiento,
  p.full_name as agendador_nombre
FROM reclutamientos r
LEFT JOIN investigaciones i ON r.investigacion_id = i.id
LEFT JOIN profiles p ON r.responsable_agendamiento = p.id
WHERE r.responsable_agendamiento IS NULL
ORDER BY r.creado_el DESC;

-- 4. CONTAR RECLUTAMIENTOS POR AGENDADOR
SELECT 
  p.full_name as agendador_nombre,
  p.email as agendador_email,
  COUNT(r.id) as total_reclutamientos,
  COUNT(CASE WHEN r.estado_agendamiento != 'd32b84d1-6209-41d9-8108-03588ca1f9b5' THEN 1 END) as reclutamientos_activos
FROM profiles p
LEFT JOIN reclutamientos r ON p.id = r.responsable_agendamiento
WHERE p.id IN (
  SELECT DISTINCT ur.user_id 
  FROM user_roles ur 
  JOIN roles_plataforma rp ON ur.role_id = rp.id 
  WHERE rp.nombre = 'Agendador'
)
GROUP BY p.id, p.full_name, p.email
ORDER BY total_reclutamientos DESC;

-- 5. VERIFICAR CONSISTENCIA DE DATOS
-- Usuarios con rol agendador que no tienen reclutamientos asignados
SELECT 
  p.id,
  p.full_name,
  p.email,
  'Agendador sin reclutamientos asignados' as problema
FROM profiles p
JOIN user_roles ur ON p.id = ur.user_id
JOIN roles_plataforma rp ON ur.role_id = rp.id
LEFT JOIN reclutamientos r ON p.id = r.responsable_agendamiento
WHERE rp.nombre = 'Agendador'
  AND r.id IS NULL;

-- 6. LIMPIAR ROLES DUPLICADOS (si existen)
-- DELETE FROM user_roles 
-- WHERE id NOT IN (
--   SELECT MIN(id) 
--   FROM user_roles 
--   GROUP BY user_id, role_id
-- );

-- 7. VERIFICAR INTEGRIDAD REFERENCIAL
SELECT 
  'user_roles sin user_id válido' as problema,
  COUNT(*) as cantidad
FROM user_roles ur
LEFT JOIN profiles p ON ur.user_id = p.id
WHERE p.id IS NULL

UNION ALL

SELECT 
  'user_roles sin role_id válido' as problema,
  COUNT(*) as cantidad
FROM user_roles ur
LEFT JOIN roles_plataforma rp ON ur.role_id = rp.id
WHERE rp.id IS NULL;
