-- Verificar reclutamientos existentes

-- 1. VERIFICAR TODOS LOS RECLUTAMIENTOS
SELECT 
  'TODOS LOS RECLUTAMIENTOS' as fuente,
  r.id as reclutamiento_id,
  r.participantes_id,
  eac.nombre as estado,
  r.updated_at
FROM reclutamientos r
JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
ORDER BY r.updated_at DESC;

-- 2. VERIFICAR RECLUTAMIENTOS FINALIZADOS
SELECT 
  'RECLUTAMIENTOS FINALIZADOS' as fuente,
  r.id as reclutamiento_id,
  r.participantes_id,
  eac.nombre as estado
FROM reclutamientos r
JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
WHERE eac.nombre = 'Finalizado'
ORDER BY r.updated_at DESC;

-- 3. VERIFICAR RECLUTAMIENTOS DE ESTE PARTICIPANTE
SELECT 
  'RECLUTAMIENTOS DEL PARTICIPANTE' as fuente,
  r.id as reclutamiento_id,
  r.participantes_id,
  eac.nombre as estado
FROM reclutamientos r
JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
WHERE r.participantes_id = '9155b800-f786-46d7-9294-bb385434d042'
ORDER BY r.updated_at DESC;

-- 4. VERIFICAR SI EXISTE EL RECLUTAMIENTO ESPECÍFICO
SELECT 
  'VERIFICAR RECLUTAMIENTO ESPECÍFICO' as fuente,
  CASE 
    WHEN EXISTS (SELECT 1 FROM reclutamientos WHERE id = '758813f1-512e-4566-af82-bcf0915de79c')
    THEN '✅ Existe'
    ELSE '❌ NO existe'
  END as resultado; 