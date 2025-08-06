-- Limpiar duplicados y corregir trigger

-- 1. LIMPIAR DUPLICADOS DE PARTICIPANTES
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

-- 2. VERIFICAR DUPLICADOS DESPUÉS DE LIMPIAR
SELECT 
  'DUPLICADOS DESPUÉS DE LIMPIAR' as fuente,
  participante_id,
  reclutamiento_id,
  COUNT(*) as cantidad
FROM historial_participacion_participantes
GROUP BY participante_id, reclutamiento_id
HAVING COUNT(*) > 1;

-- 3. CORREGIR TRIGGER PARA EVITAR DUPLICADOS
CREATE OR REPLACE FUNCTION trigger_estadisticas_final()
RETURNS TRIGGER AS $func$
DECLARE
    participante_existe BOOLEAN;
    empresa_existe BOOLEAN;
    empresa_id_participante UUID;
BEGIN
    -- Solo procesar si el estado es 'Finalizado'
    IF NEW.estado_agendamiento = (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado') THEN
        
        -- OBTENER EMPRESA_ID DEL PARTICIPANTE
        SELECT p.empresa_id INTO empresa_id_participante
        FROM participantes p
        WHERE p.id = NEW.participantes_id;
        
        -- VERIFICAR SI YA EXISTE EN HISTORIAL DE PARTICIPANTES (MÁS ROBUSTO)
        SELECT EXISTS(
            SELECT 1 FROM historial_participacion_participantes 
            WHERE participante_id = NEW.participantes_id 
            AND reclutamiento_id = NEW.id
            AND estado_sesion = 'completada'
        ) INTO participante_existe;
        
        -- VERIFICAR SI YA EXISTE EN HISTORIAL DE EMPRESAS (MÁS ROBUSTO)
        SELECT EXISTS(
            SELECT 1 FROM historial_participacion_empresas 
            WHERE empresa_id = empresa_id_participante
            AND reclutamiento_id = NEW.id
            AND estado_sesion = 'completada'
        ) INTO empresa_existe;
        
        -- INSERTAR PARTICIPANTE SOLO SI NO EXISTE
        IF NEW.participantes_id IS NOT NULL AND NOT participante_existe THEN
            INSERT INTO historial_participacion_participantes (
                participante_id, reclutamiento_id, investigacion_id, empresa_id,
                fecha_participacion, estado_sesion, duracion_sesion,
                created_at, updated_at
            ) VALUES (
                NEW.participantes_id, NEW.id, NEW.investigacion_id,
                empresa_id_participante,
                NEW.fecha_sesion, 'completada', NEW.duracion_sesion,
                NOW(), NOW()
            );
        END IF;
        
        -- INSERTAR EMPRESA SOLO SI NO EXISTE Y HAY EMPRESA_ID
        IF empresa_id_participante IS NOT NULL AND NOT empresa_existe THEN
            INSERT INTO historial_participacion_empresas (
                empresa_id, reclutamiento_id, investigacion_id, participante_id,
                fecha_participacion, estado_sesion, duracion_sesion,
                created_at, updated_at
            ) VALUES (
                empresa_id_participante,
                NEW.id, NEW.investigacion_id, NEW.participantes_id,
                NEW.fecha_sesion, 'completada', NEW.duracion_sesion,
                NOW(), NOW()
            );
        END IF;
        
    END IF;
    
    RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

-- 4. VERIFICAR ESTADO FINAL
SELECT 
  'ESTADO FINAL' as fuente,
  'Participantes' as tipo,
  COUNT(*) as total_registros
FROM historial_participacion_participantes
UNION ALL
SELECT 
  'ESTADO FINAL' as fuente,
  'Empresas' as tipo,
  COUNT(*) as total_registros
FROM historial_participacion_empresas; 