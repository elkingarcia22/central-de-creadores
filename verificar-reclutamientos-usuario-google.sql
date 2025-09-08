-- Verificar si el usuario con Google Calendar tiene reclutamientos

-- 1. Información del usuario con Google Calendar
SELECT 
  'USUARIO_GOOGLE' as tipo,
  id,
  nombre,
  correo
FROM public.usuarios 
WHERE id = 'e1d4eb8b-83ae-4acc-9d31-6cedc776b64d';

-- 2. Reclutamientos del usuario con Google Calendar
SELECT 
  'RECLUTAMIENTOS_GOOGLE' as tipo,
  COUNT(*) as total_reclutamientos
FROM public.reclutamientos 
WHERE reclutador_id = 'e1d4eb8b-83ae-4acc-9d31-6cedc776b64d';

-- 3. Detalle de reclutamientos del usuario con Google Calendar
SELECT 
  'DETALLE_RECLUTAMIENTOS_GOOGLE' as tipo,
  id,
  fecha_sesion,
  duracion_sesion,
  investigacion_id,
  participantes_id,
  participantes_internos_id,
  participantes_friend_family_id
FROM public.reclutamientos 
WHERE reclutador_id = 'e1d4eb8b-83ae-4acc-9d31-6cedc776b64d'
ORDER BY fecha_sesion
LIMIT 5;

-- 4. Verificar si hay reclutamientos para otros usuarios
SELECT 
  'OTROS_USUARIOS_CON_RECLUTAMIENTOS' as tipo,
  r.reclutador_id,
  u.nombre,
  u.correo,
  COUNT(*) as total_reclutamientos
FROM public.reclutamientos r
INNER JOIN public.usuarios u ON r.reclutador_id = u.id
GROUP BY r.reclutador_id, u.nombre, u.correo
ORDER BY total_reclutamientos DESC
LIMIT 10;
