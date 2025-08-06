-- Deshabilitar trigger y limpiar duplicados

-- 1. DESHABILITAR EL TRIGGER TEMPORALMENTE
DROP TRIGGER IF EXISTS trigger_estadisticas_sin_duplicados ON reclutamientos;

-- 2. LIMPIAR DUPLICADOS DEL HISTORIAL DE PARTICIPANTES
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

-- 3. VERIFICAR QUE NO QUEDEN DUPLICADOS
SELECT 
  'VERIFICACIÓN SIN DUPLICADOS' as fuente,
  participante_id,
  reclutamiento_id,
  COUNT(*) as cantidad
FROM historial_participacion_participantes
GROUP BY participante_id, reclutamiento_id
HAVING COUNT(*) > 1;

-- 4. VERIFICAR TOTAL FINAL
SELECT 
  'TOTAL FINAL' as fuente,
  COUNT(*) as total_registros
FROM historial_participacion_participantes; 