-- Verificar reclutamientos existentes
SELECT 
  id,
  investigacion_id,
  participantes_id,
  participantes_internos_id,
  participantes_friend_family_id,
  reclutador_id,
  tipo_participante,
  estado_agendamiento,
  created_at
FROM reclutamientos 
ORDER BY created_at DESC 
LIMIT 10; 