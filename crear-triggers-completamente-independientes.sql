-- Crear triggers completamente independientes
-- El trigger de empresas NO debe tocar participantes

-- 1. ELIMINAR TODOS LOS TRIGGERS EXISTENTES
DROP TRIGGER IF EXISTS trigger_empresas_independiente ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_participantes_independiente ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_empresas_independiente ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_participantes_independiente ON reclutamientos;

-- 2. ELIMINAR FUNCIONES EXISTENTES
DROP FUNCTION IF EXISTS trigger_empresas_independiente();
DROP FUNCTION IF EXISTS trigger_participantes_independiente();

-- 3. CREAR FUNCIÓN SOLO PARA EMPRESAS (SIN TOCAR PARTICIPANTES)
CREATE OR REPLACE FUNCTION trigger_empresas_solo()
RETURNS TRIGGER AS $func$
BEGIN
    -- SOLO manejar empresas, NUNCA participantes
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        -- Verificar si ya existe en historial de empresas
        IF NOT EXISTS (
            SELECT 1 FROM historial_participacion_empresas 
            WHERE empresa_id = NEW.empresa_id 
            AND reclutamiento_id = NEW.id
        ) THEN
            -- Insertar SOLO en historial de empresas
            INSERT INTO historial_participacion_empresas (
                empresa_id,
                reclutamiento_id,
                estado_sesion,
                created_at,
                updated_at
            ) VALUES (
                NEW.empresa_id,
                NEW.id,
                NEW.estado_sesion,
                NOW(),
                NOW()
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

-- 4. CREAR FUNCIÓN SOLO PARA PARTICIPANTES (SIN TOCAR EMPRESAS)
CREATE OR REPLACE FUNCTION trigger_participantes_solo()
RETURNS TRIGGER AS $func$
BEGIN
    -- SOLO manejar participantes, NUNCA empresas
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        -- Verificar si ya existe en historial de participantes
        IF NOT EXISTS (
            SELECT 1 FROM historial_participacion_participantes 
            WHERE participante_id = NEW.participante_id 
            AND reclutamiento_id = NEW.id
        ) THEN
            -- Insertar SOLO en historial de participantes
            INSERT INTO historial_participacion_participantes (
                participante_id,
                reclutamiento_id,
                estado_sesion,
                created_at,
                updated_at
            ) VALUES (
                NEW.participante_id,
                NEW.id,
                NEW.estado_sesion,
                NOW(),
                NOW()
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

-- 5. CREAR TRIGGERS SEPARADOS
CREATE TRIGGER trigger_empresas_solo
    AFTER INSERT OR UPDATE ON reclutamientos
    FOR EACH ROW
    EXECUTE FUNCTION trigger_empresas_solo();

CREATE TRIGGER trigger_participantes_solo
    AFTER INSERT OR UPDATE ON reclutamientos
    FOR EACH ROW
    EXECUTE FUNCTION trigger_participantes_solo();

-- 6. VERIFICAR TRIGGERS CREADOS
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'reclutamientos'
ORDER BY trigger_name; 