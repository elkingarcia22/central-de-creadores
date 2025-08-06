-- Verificar el participante que está causando el problema
SELECT 
  id,
  nombre,
  email,
  tipo,
  empresa_id,
  estado_participante,
  fecha_ultima_participacion,
  total_participaciones,
  created_at,
  updated_at
FROM participantes 
WHERE id = '6e326ce8-b3ab-4a64-9a45-bb7fbc762e79'; 