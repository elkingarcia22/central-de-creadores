-- Verificar el código de la función trigger

-- 1. VER EL CÓDIGO DE LA FUNCIÓN
SELECT 
  'CÓDIGO DE LA FUNCIÓN' as fuente,
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'trigger_estadisticas_sin_duplicados';

-- 2. VERIFICAR DUPLICADOS ACTUALES
SELECT 
  'DUPLICADOS ACTUALES' as fuente,
  participante_id,
  reclutamiento_id,
  COUNT(*) as cantidad_duplicados
FROM historial_participacion_participantes
GROUP BY participante_id, reclutamiento_id
HAVING COUNT(*) > 1
ORDER BY cantidad_duplicados DESC;

-- 3. VERIFICAR DATOS ESPECÍFICOS DEL ÚLTIMO RECLUTAMIENTO
SELECT 
  'DATOS DEL ÚLTIMO RECLUTAMIENTO' as fuente,
  r.id as reclutamiento_id,
  r.participantes_id,
  eac.nombre as estado,
  hpp.id as historial_id,
  hpp.estado_sesion
FROM reclutamientos r
JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
LEFT JOIN historial_participacion_participantes hpp ON r.id = hpp.reclutamiento_id
WHERE r.id = '758813f1-512e-4566-af82-bcf0915de79c'; 