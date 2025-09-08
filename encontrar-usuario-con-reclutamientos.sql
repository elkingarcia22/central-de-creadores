-- Encontrar usuarios que tengan reclutamientos asignados

-- 1. Usuarios con reclutamientos
SELECT 
  u.id,
  u.nombre,
  u.correo,
  COUNT(r.id) as total_reclutamientos
FROM public.usuarios u
INNER JOIN public.reclutamientos r ON u.id = r.reclutador_id
GROUP BY u.id, u.nombre, u.correo
ORDER BY total_reclutamientos DESC
LIMIT 10;

-- 2. Detalle de reclutamientos por usuario
SELECT 
  u.id as usuario_id,
  u.nombre as usuario_nombre,
  u.correo as usuario_correo,
  r.id as reclutamiento_id,
  r.fecha_sesion,
  r.duracion_sesion,
  r.investigacion_id,
  r.participantes_id,
  r.participantes_internos_id,
  r.participantes_friend_family_id
FROM public.usuarios u
INNER JOIN public.reclutamientos r ON u.id = r.reclutador_id
ORDER BY u.nombre, r.fecha_sesion
LIMIT 20;
