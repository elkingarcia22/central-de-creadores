-- ====================================
-- CORREGIR LÓGICA DE ESTADOS DE RECLUTAMIENTO CON FECHA Y HORA
-- ====================================

-- 1. VERIFICAR ESTADOS EXISTENTES
SELECT '=== VERIFICANDO ESTADOS EXISTENTES ===' as info;
SELECT id, nombre, activo FROM estado_agendamiento_cat ORDER BY nombre;

-- 2. CREAR FUNCIÓN MEJORADA PARA ACTUALIZAR ESTADO AUTOMÁTICAMENTE
CREATE OR REPLACE FUNCTION actualizar_estado_reclutamiento_automatico()
RETURNS TRIGGER AS $$
DECLARE
    fecha_actual TIMESTAMP WITH TIME ZONE;
    fecha_sesion TIMESTAMP WITH TIME ZONE;
    fecha_sesion_dia DATE;
    fecha_actual_dia DATE;
    estado_pendiente_id UUID;
    estado_en_progreso_id UUID;
    estado_finalizado_id UUID;
    nuevo_estado_id UUID;
BEGIN
    -- Obtener fecha actual
    fecha_actual := NOW();
    fecha_actual_dia := CURRENT_DATE;
    
    -- Obtener fecha de sesión del reclutamiento
    fecha_sesion := NEW.fecha_sesion;
    
    -- Obtener IDs de estados
    SELECT id INTO estado_pendiente_id FROM estado_agendamiento_cat WHERE nombre = 'Pendiente';
    SELECT id INTO estado_en_progreso_id FROM estado_agendamiento_cat WHERE nombre = 'En progreso';
    SELECT id INTO estado_finalizado_id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado';
    
    -- Lógica de estados mejorada
    IF fecha_sesion IS NULL THEN
        -- Sin fecha de sesión = Pendiente de agendamiento
        nuevo_estado_id := (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Pendiente de agendamiento');
    ELSIF fecha_sesion > fecha_actual THEN
        -- Fecha futura = Pendiente
        nuevo_estado_id := estado_pendiente_id;
    ELSIF DATE(fecha_sesion) = fecha_actual_dia THEN
        -- Mismo día = En progreso (sin importar la hora)
        nuevo_estado_id := estado_en_progreso_id;
    ELSE
        -- Día anterior = Finalizado
        nuevo_estado_id := estado_finalizado_id;
    END IF;
    
    -- Actualizar el estado solo si es diferente
    IF NEW.estado_agendamiento IS DISTINCT FROM nuevo_estado_id THEN
        NEW.estado_agendamiento := nuevo_estado_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. CREAR TRIGGER PARA INSERT Y UPDATE
DROP TRIGGER IF EXISTS trigger_actualizar_estado_reclutamiento ON reclutamientos;

CREATE TRIGGER trigger_actualizar_estado_reclutamiento
    BEFORE INSERT OR UPDATE ON reclutamientos
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_estado_reclutamiento_automatico();

-- 4. ACTUALIZAR ESTADOS EXISTENTES
SELECT '=== ACTUALIZANDO ESTADOS EXISTENTES ===' as info;

UPDATE reclutamientos 
SET estado_agendamiento = CASE
    WHEN fecha_sesion IS NULL THEN 
        (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Pendiente de agendamiento')
    WHEN fecha_sesion > NOW() THEN 
        (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Pendiente')
    WHEN DATE(fecha_sesion) = CURRENT_DATE THEN 
        (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'En progreso')
    ELSE 
        (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado')
END
WHERE estado_agendamiento IS NULL OR estado_agendamiento != CASE
    WHEN fecha_sesion IS NULL THEN 
        (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Pendiente de agendamiento')
    WHEN fecha_sesion > NOW() THEN 
        (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Pendiente')
    WHEN DATE(fecha_sesion) = CURRENT_DATE THEN 
        (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'En progreso')
    ELSE 
        (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado')
END;

-- 5. VERIFICAR RESULTADOS
SELECT '=== VERIFICANDO RESULTADOS ===' as info;

SELECT 
    r.id,
    r.fecha_sesion,
    ea.nombre as estado_actual,
    CASE
        WHEN r.fecha_sesion IS NULL THEN 'Pendiente de agendamiento'
        WHEN r.fecha_sesion > NOW() THEN 'Pendiente'
        WHEN DATE(r.fecha_sesion) = CURRENT_DATE THEN 'En progreso'
        ELSE 'Finalizado'
    END as estado_calculado
FROM reclutamientos r
LEFT JOIN estado_agendamiento_cat ea ON r.estado_agendamiento = ea.id
ORDER BY r.fecha_sesion DESC
LIMIT 10;

-- 6. CREAR FUNCIÓN PARA ACTUALIZAR ESTADOS MANUALMENTE (ÚTIL PARA CRON JOBS)
CREATE OR REPLACE FUNCTION actualizar_estados_reclutamiento_batch()
RETURNS INTEGER AS $$
DECLARE
    registros_actualizados INTEGER := 0;
BEGIN
    UPDATE reclutamientos 
    SET estado_agendamiento = CASE
        WHEN fecha_sesion IS NULL THEN 
            (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Pendiente de agendamiento')
        WHEN fecha_sesion > NOW() THEN 
            (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Pendiente')
        WHEN DATE(fecha_sesion) = CURRENT_DATE THEN 
            (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'En progreso')
        ELSE 
            (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado')
    END
    WHERE estado_agendamiento IS NULL OR estado_agendamiento != CASE
        WHEN fecha_sesion IS NULL THEN 
            (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Pendiente de agendamiento')
        WHEN fecha_sesion > NOW() THEN 
            (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Pendiente')
        WHEN DATE(fecha_sesion) = CURRENT_DATE THEN 
            (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'En progreso')
        ELSE 
            (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado')
    END;
    
    GET DIAGNOSTICS registros_actualizados = ROW_COUNT;
    RETURN registros_actualizados;
END;
$$ LANGUAGE plpgsql;

-- 7. VERIFICAR QUE LA FUNCIÓN FUNCIONA
SELECT '=== PROBANDO FUNCIÓN BATCH ===' as info;
SELECT actualizar_estados_reclutamiento_batch() as registros_actualizados;

-- 8. MOSTRAR RESUMEN FINAL
SELECT '=== RESUMEN FINAL ===' as info;
SELECT 
    ea.nombre as estado,
    COUNT(*) as cantidad
FROM reclutamientos r
LEFT JOIN estado_agendamiento_cat ea ON r.estado_agendamiento = ea.id
GROUP BY ea.nombre, ea.id
ORDER BY ea.id; 