-- Crear triggers independientes

-- 1. ELIMINAR TRIGGER ÚNICO
DROP TRIGGER IF EXISTS trigger_estadisticas_final ON reclutamientos;

-- 2. CREAR TRIGGER SOLO PARA PARTICIPANTES
CREATE OR REPLACE FUNCTION trigger_participantes_independiente()
RETURNS TRIGGER AS $func$
DECLARE
    participante_existe BOOLEAN;
BEGIN
    -- Solo procesar si el estado es 'Finalizado'
    IF NEW.estado_agendamiento = (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado') THEN
        
        -- VERIFICAR SI YA EXISTE EN HISTORIAL DE PARTICIPANTES
        SELECT EXISTS(
            SELECT 1 FROM historial_participacion_participantes 
            WHERE participante_id = NEW.participantes_id 
            AND reclutamiento_id = NEW.id
            AND estado_sesion = 'completada'
        ) INTO participante_existe;
        
        -- INSERTAR PARTICIPANTE SOLO SI NO EXISTE
        IF NEW.participantes_id IS NOT NULL AND NOT participante_existe THEN
            INSERT INTO historial_participacion_participantes (
                participante_id, reclutamiento_id, investigacion_id, empresa_id,
                fecha_participacion, estado_sesion, duracion_sesion,
                created_at, updated_at
            ) VALUES (
                NEW.participantes_id, NEW.id, NEW.investigacion_id,
                (SELECT empresa_id FROM participantes WHERE id = NEW.participantes_id),
                NEW.fecha_sesion, 'completada', NEW.duracion_sesion,
                NOW(), NOW()
            );
        END IF;
        
    END IF;
    
    RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

-- 3. CREAR TRIGGER SOLO PARA EMPRESAS
CREATE OR REPLACE FUNCTION trigger_empresas_independiente()
RETURNS TRIGGER AS $func$
DECLARE
    empresa_existe BOOLEAN;
    empresa_id_participante UUID;
BEGIN
    -- Solo procesar si el estado es 'Finalizado'
    IF NEW.estado_agendamiento = (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado') THEN
        
        -- OBTENER EMPRESA_ID DEL PARTICIPANTE
        SELECT p.empresa_id INTO empresa_id_participante
        FROM participantes p
        WHERE p.id = NEW.participantes_id;
        
        -- VERIFICAR SI YA EXISTE EN HISTORIAL DE EMPRESAS
        SELECT EXISTS(
            SELECT 1 FROM historial_participacion_empresas 
            WHERE empresa_id = empresa_id_participante
            AND reclutamiento_id = NEW.id
            AND estado_sesion = 'completada'
        ) INTO empresa_existe;
        
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

-- 4. CREAR TRIGGERS INDEPENDIENTES
CREATE TRIGGER trigger_participantes_independiente
    AFTER INSERT OR UPDATE ON reclutamientos
    FOR EACH ROW
    EXECUTE FUNCTION trigger_participantes_independiente();

CREATE TRIGGER trigger_empresas_independiente
    AFTER INSERT OR UPDATE ON reclutamientos
    FOR EACH ROW
    EXECUTE FUNCTION trigger_empresas_independiente();

-- 5. VERIFICAR TRIGGERS CREADOS
SELECT 
  'TRIGGERS INDEPENDIENTES' as fuente,
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers 
WHERE trigger_name LIKE '%independiente%'
ORDER BY trigger_name, event_manipulation; 