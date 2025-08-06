-- Corregir trigger para obtener empresa a través del participante

-- 1. CORREGIR FUNCIÓN DEL TRIGGER
CREATE OR REPLACE FUNCTION trigger_estadisticas_robusto()
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
        
        -- VERIFICAR SI YA EXISTE EN HISTORIAL DE PARTICIPANTES
        SELECT EXISTS(
            SELECT 1 FROM historial_participacion_participantes 
            WHERE participante_id = NEW.participantes_id 
            AND reclutamiento_id = NEW.id
        ) INTO participante_existe;
        
        -- VERIFICAR SI YA EXISTE EN HISTORIAL DE EMPRESAS
        SELECT EXISTS(
            SELECT 1 FROM historial_participacion_empresas 
            WHERE empresa_id = empresa_id_participante
            AND reclutamiento_id = NEW.id
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
            RAISE LOG '✅ Insertado participante: %', NEW.participantes_id;
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
            RAISE LOG '✅ Insertada empresa: %', empresa_id_participante;
        END IF;
        
    END IF;
    
    RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

-- 2. VERIFICAR QUE EL TRIGGER SE ACTUALIZÓ
SELECT 
  'TRIGGER ACTUALIZADO' as fuente,
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_estadisticas_robusto'; 