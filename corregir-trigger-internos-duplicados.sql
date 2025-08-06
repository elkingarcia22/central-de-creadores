-- Corregir trigger internos para permitir múltiples reclutamientos

-- 1. ELIMINAR TRIGGER EXISTENTE
DROP TRIGGER IF EXISTS trigger_participantes_internos ON reclutamientos;

-- 2. ELIMINAR FUNCIÓN EXISTENTE
DROP FUNCTION IF EXISTS trigger_participantes_internos();

-- 3. CREAR FUNCIÓN CORREGIDA (PERMITE MÚLTIPLES RECLUTAMIENTOS)
CREATE OR REPLACE FUNCTION trigger_participantes_internos()
RETURNS TRIGGER AS $func$
BEGIN
    -- SOLO manejar participantes internos
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        -- Solo procesar si hay participante interno
        IF NEW.participantes_internos_id IS NOT NULL THEN
            -- Verificar si ya existe en historial de participantes internos (POR RECLUTAMIENTO)
            IF NOT EXISTS (
                SELECT 1 FROM historial_participacion_participantes_internos 
                WHERE participante_interno_id = NEW.participantes_internos_id 
                AND investigacion_id = NEW.investigacion_id
                AND reclutamiento_id = NEW.id
            ) THEN
                -- Insertar SOLO en historial de participantes internos (PERMITE MÚLTIPLES)
                INSERT INTO historial_participacion_participantes_internos (
                    participante_interno_id,
                    investigacion_id,
                    reclutamiento_id,
                    estado_sesion,
                    created_at,
                    updated_at
                ) VALUES (
                    NEW.participantes_internos_id,
                    NEW.investigacion_id,
                    NEW.id,
                    CASE 
                        WHEN NEW.estado_agendamiento IS NOT NULL THEN 'completada'
                        ELSE 'pendiente'
                    END,
                    NOW(),
                    NOW()
                );
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log del error pero no fallar
        RAISE LOG 'Error en trigger_participantes_internos: %', SQLERRM;
        RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

-- 4. CREAR TRIGGER CORREGIDO
CREATE TRIGGER trigger_participantes_internos
    AFTER INSERT OR UPDATE ON reclutamientos
    FOR EACH ROW
    EXECUTE FUNCTION trigger_participantes_internos();

-- 5. VERIFICAR TRIGGER CREADO
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'reclutamientos'
ORDER BY trigger_name; 