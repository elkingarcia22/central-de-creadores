-- Corregir triggers sin empresa_id (solo participantes)

-- 1. ELIMINAR TRIGGERS EXISTENTES
DROP TRIGGER IF EXISTS trigger_empresas_solo ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_participantes_solo ON reclutamientos;

-- 2. ELIMINAR FUNCIONES EXISTENTES
DROP FUNCTION IF EXISTS trigger_empresas_solo();
DROP FUNCTION IF EXISTS trigger_participantes_solo();

-- 3. CREAR FUNCIÓN SOLO PARA PARTICIPANTES (CORREGIDA)
CREATE OR REPLACE FUNCTION trigger_participantes_solo()
RETURNS TRIGGER AS $func$
BEGIN
    -- SOLO manejar participantes externos
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        -- Solo procesar si hay participante externo
        IF NEW.participantes_id IS NOT NULL THEN
            -- Verificar si ya existe en historial de participantes
            IF NOT EXISTS (
                SELECT 1 FROM historial_participacion_participantes 
                WHERE participante_id = NEW.participantes_id 
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
                    NEW.participantes_id,
                    NEW.id,
                    NEW.estado_agendamiento,
                    NOW(),
                    NOW()
                );
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

-- 4. CREAR TRIGGER SOLO PARA PARTICIPANTES
CREATE TRIGGER trigger_participantes_solo
    AFTER INSERT OR UPDATE ON reclutamientos
    FOR EACH ROW
    EXECUTE FUNCTION trigger_participantes_solo();

-- 5. VERIFICAR TRIGGERS CREADOS
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'reclutamientos'
ORDER BY trigger_name; 