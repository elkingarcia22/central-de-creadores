-- ====================================
-- FUNCIÓN PARA CALCULAR ESTADO DE AGENDAMIENTO AUTOMÁTICAMENTE
-- ====================================
-- Ejecutar en Supabase SQL Editor

-- 1. Crear función para calcular estado de agendamiento
CREATE OR REPLACE FUNCTION calcular_estado_agendamiento_automatico()
RETURNS TRIGGER AS $$
DECLARE
    fecha_actual TIMESTAMP WITH TIME ZONE;
    fecha_sesion TIMESTAMP WITH TIME ZONE;
    fecha_fin_sesion TIMESTAMP WITH TIME ZONE;
    duracion_minutos INTEGER;
    estado_pendiente_id UUID;
    estado_en_progreso_id UUID;
    estado_finalizado_id UUID;
    estado_pendiente_agendamiento_id UUID;
    nuevo_estado_id UUID;
BEGIN
    -- Obtener fecha actual en zona horaria de Colombia
    fecha_actual := NOW() AT TIME ZONE 'America/Bogota';
    
    -- Obtener IDs de estados
    SELECT id INTO estado_pendiente_id FROM estado_agendamiento_cat WHERE nombre = 'Pendiente';
    SELECT id INTO estado_en_progreso_id FROM estado_agendamiento_cat WHERE nombre = 'En progreso';
    SELECT id INTO estado_finalizado_id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado';
    SELECT id INTO estado_pendiente_agendamiento_id FROM estado_agendamiento_cat WHERE nombre = 'Pendiente de agendamiento';
    
    -- Si no hay fecha de sesión, es "Pendiente de agendamiento"
    IF NEW.fecha_sesion IS NULL THEN
        NEW.estado_agendamiento := estado_pendiente_agendamiento_id;
        RETURN NEW;
    END IF;
    
    -- Convertir fecha de sesión a zona horaria de Colombia
    fecha_sesion := NEW.fecha_sesion AT TIME ZONE 'America/Bogota';
    duracion_minutos := COALESCE(NEW.duracion_sesion, 60);
    
    -- Calcular fecha de fin de sesión
    fecha_fin_sesion := fecha_sesion + (duracion_minutos || ' minutes')::INTERVAL;
    
    -- Determinar estado basado en fechas
    IF fecha_actual < fecha_sesion THEN
        -- Sesión en el futuro = Pendiente
        nuevo_estado_id := estado_pendiente_id;
    ELSIF fecha_actual >= fecha_sesion AND fecha_actual <= fecha_fin_sesion THEN
        -- Sesión en curso = En progreso
        nuevo_estado_id := estado_en_progreso_id;
    ELSE
        -- Sesión ya pasó = Finalizado
        nuevo_estado_id := estado_finalizado_id;
    END IF;
    
    -- Solo actualizar si el estado es diferente
    IF NEW.estado_agendamiento IS NULL OR NEW.estado_agendamiento != nuevo_estado_id THEN
        NEW.estado_agendamiento := nuevo_estado_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Crear trigger para actualizar estado automáticamente
DROP TRIGGER IF EXISTS trigger_calcular_estado_agendamiento ON reclutamientos;

CREATE TRIGGER trigger_calcular_estado_agendamiento
    BEFORE INSERT OR UPDATE ON reclutamientos
    FOR EACH ROW
    EXECUTE FUNCTION calcular_estado_agendamiento_automatico();

-- 3. Función para actualizar estados existentes
CREATE OR REPLACE FUNCTION actualizar_estados_agendamiento_existentes()
RETURNS INTEGER AS $$
DECLARE
    reclutamiento_record RECORD;
    fecha_actual TIMESTAMP WITH TIME ZONE;
    fecha_sesion TIMESTAMP WITH TIME ZONE;
    fecha_fin_sesion TIMESTAMP WITH TIME ZONE;
    duracion_minutos INTEGER;
    estado_pendiente_id UUID;
    estado_en_progreso_id UUID;
    estado_finalizado_id UUID;
    estado_pendiente_agendamiento_id UUID;
    nuevo_estado_id UUID;
    actualizados INTEGER := 0;
BEGIN
    -- Obtener fecha actual en zona horaria de Colombia
    fecha_actual := NOW() AT TIME ZONE 'America/Bogota';
    
    -- Obtener IDs de estados
    SELECT id INTO estado_pendiente_id FROM estado_agendamiento_cat WHERE nombre = 'Pendiente';
    SELECT id INTO estado_en_progreso_id FROM estado_agendamiento_cat WHERE nombre = 'En progreso';
    SELECT id INTO estado_finalizado_id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado';
    SELECT id INTO estado_pendiente_agendamiento_id FROM estado_agendamiento_cat WHERE nombre = 'Pendiente de agendamiento';
    
    -- Recorrer todos los reclutamientos
    FOR reclutamiento_record IN 
        SELECT id, fecha_sesion, duracion_sesion, estado_agendamiento
        FROM reclutamientos
    LOOP
        -- Si no hay fecha de sesión, es "Pendiente de agendamiento"
        IF reclutamiento_record.fecha_sesion IS NULL THEN
            nuevo_estado_id := estado_pendiente_agendamiento_id;
        ELSE
            -- Convertir fecha de sesión a zona horaria de Colombia
            fecha_sesion := reclutamiento_record.fecha_sesion AT TIME ZONE 'America/Bogota';
            duracion_minutos := COALESCE(reclutamiento_record.duracion_sesion, 60);
            
            -- Calcular fecha de fin de sesión
            fecha_fin_sesion := fecha_sesion + (duracion_minutos || ' minutes')::INTERVAL;
            
            -- Determinar estado basado en fechas
            IF fecha_actual < fecha_sesion THEN
                nuevo_estado_id := estado_pendiente_id;
            ELSIF fecha_actual >= fecha_sesion AND fecha_actual <= fecha_fin_sesion THEN
                nuevo_estado_id := estado_en_progreso_id;
            ELSE
                nuevo_estado_id := estado_finalizado_id;
            END IF;
        END IF;
        
        -- Actualizar si el estado es diferente
        IF reclutamiento_record.estado_agendamiento IS NULL OR reclutamiento_record.estado_agendamiento != nuevo_estado_id THEN
            UPDATE reclutamientos 
            SET estado_agendamiento = nuevo_estado_id
            WHERE id = reclutamiento_record.id;
            actualizados := actualizados + 1;
        END IF;
    END LOOP;
    
    RETURN actualizados;
END;
$$ LANGUAGE plpgsql;

-- 4. Ejecutar actualización de estados existentes
SELECT actualizar_estados_agendamiento_existentes() as reclutamientos_actualizados;

-- 5. Verificar resultados
SELECT 
    '=== ESTADOS ACTUALIZADOS ===' as info,
    r.id,
    r.fecha_sesion,
    r.duracion_sesion,
    eac.nombre as estado_actual
FROM reclutamientos r
LEFT JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
ORDER BY r.fecha_sesion DESC
LIMIT 10; 