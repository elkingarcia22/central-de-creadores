-- Verificar reclutamientos del usuario que tiene Google Calendar conectado

-- 1. Información del usuario
SELECT 
  'USUARIO_INFO' as tipo,
  id,
  nombre,
  correo
FROM public.usuarios 
WHERE id = 'e1d4eb8b-83ae-4acc-9d31-6cedc776b64d';

-- 2. Reclutamientos del usuario
SELECT 
  'RECLUTAMIENTOS_USUARIO' as tipo,
  COUNT(*) as total_reclutamientos
FROM public.reclutamientos 
WHERE reclutador_id = 'e1d4eb8b-83ae-4acc-9d31-6cedc776b64d';

-- 3. Detalle de reclutamientos
SELECT 
  'DETALLE_RECLUTAMIENTOS' as tipo,
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
