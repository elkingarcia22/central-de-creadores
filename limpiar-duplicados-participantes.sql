-- Limpiar duplicados del historial de participantes

-- 1. VERIFICAR DUPLICADOS ANTES DE LIMPIAR
SELECT 
  'DUPLICADOS ANTES DE LIMPIAR' as fuente,
  participante_id,
  reclutamiento_id,
  COUNT(*) as cantidad_duplicados
FROM historial_participacion_participantes
GROUP BY participante_id, reclutamiento_id
HAVING COUNT(*) > 1;

-- 2. ELIMINAR DUPLICADOS MANTENIENDO SOLO EL MÁS RECIENTE
DELETE FROM historial_participacion_participantes 
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY participante_id, reclutamiento_id 
             ORDER BY created_at DESC
           ) as rn
    FROM historial_participacion_participantes
  ) t
  WHERE t.rn > 1
);

-- 3. VERIFICAR DUPLICADOS DESPUÉS DE LIMPIAR
SELECT 
  'DUPLICADOS DESPUÉS DE LIMPIAR' as fuente,
  participante_id,
  reclutamiento_id,
  COUNT(*) as cantidad_duplicados
FROM historial_participacion_participantes
GROUP BY participante_id, reclutamiento_id
HAVING COUNT(*) > 1;

-- 4. VERIFICAR TOTAL DESPUÉS DE LIMPIAR
SELECT 
  'TOTAL DESPUÉS DE LIMPIAR' as fuente,
  COUNT(*) as total_registros
FROM historial_participacion_participantes; 