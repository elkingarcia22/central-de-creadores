-- ====================================
-- LÓGICA DE ESTADOS CON DURACIÓN DE SESIÓN
-- ====================================

-- 1. VERIFICAR ESTRUCTURA ACTUAL
SELECT '=== VERIFICANDO ESTRUCTURA ===' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'reclutamientos' 
AND column_name IN ('fecha_sesion', 'duracion_sesion', 'estado_agendamiento')
ORDER BY ordinal_position;

-- 2. CREAR FUNCIÓN MEJORADA CON DURACIÓN
CREATE OR REPLACE FUNCTION actualizar_estado_reclutamiento_con_duracion()
RETURNS TRIGGER AS $$
DECLARE
    fecha_actual TIMESTAMP WITH TIME ZONE;
    fecha_inicio_sesion TIMESTAMP WITH TIME ZONE;
    fecha_fin_sesion TIMESTAMP WITH TIME ZONE;
    duracion_sesion_minutos INTEGER;
    estado_pendiente_id UUID;
    estado_en_progreso_id UUID;
    estado_finalizado_id UUID;
    estado_pendiente_agendamiento_id UUID;
    nuevo_estado_id UUID;
BEGIN
    -- Obtener fecha actual
    fecha_actual := NOW();
    
    -- Obtener fecha de sesión y duración del reclutamiento
    fecha_inicio_sesion := NEW.fecha_sesion;
    duracion_sesion_minutos := COALESCE(NEW.duracion_sesion, 60); -- por defecto 60 minutos
    
    -- Calcular fecha de fin de sesión
    fecha_fin_sesion := fecha_inicio_sesion + (duracion_sesion_minutos || ' minutes')::INTERVAL;
    
    -- Obtener IDs de estados
    SELECT id INTO estado_pendiente_id FROM estado_agendamiento_cat WHERE nombre = 'Pendiente';
    SELECT id INTO estado_en_progreso_id FROM estado_agendamiento_cat WHERE nombre = 'En progreso';
    SELECT id INTO estado_finalizado_id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado';
    SELECT id INTO estado_pendiente_agendamiento_id FROM estado_agendamiento_cat WHERE nombre = 'Pendiente de agendamiento';
    
    -- Debug: Imprimir información
    RAISE NOTICE 'Fecha actual: %, Fecha inicio: %, Fecha fin: %, Duración: % minutos', 
                 fecha_actual, fecha_inicio_sesion, fecha_fin_sesion, duracion_sesion_minutos;
    
    -- Lógica de estados mejorada con duración
    IF fecha_inicio_sesion IS NULL THEN
        -- Sin fecha de sesión = Pendiente de agendamiento
        nuevo_estado_id := estado_pendiente_agendamiento_id;
        RAISE NOTICE 'Estado asignado: Pendiente de agendamiento (sin fecha)';
    ELSIF fecha_actual < fecha_inicio_sesion THEN
        -- Antes del inicio = Pendiente
        nuevo_estado_id := estado_pendiente_id;
        RAISE NOTICE 'Estado asignado: Pendiente (antes del inicio)';
    ELSIF fecha_actual >= fecha_inicio_sesion AND fecha_actual <= fecha_fin_sesion THEN
        -- Durante la sesión = En progreso
        nuevo_estado_id := estado_en_progreso_id;
        RAISE NOTICE 'Estado asignado: En progreso (durante la sesión)';
    ELSE
        -- Después del fin = Finalizado
        nuevo_estado_id := estado_finalizado_id;
        RAISE NOTICE 'Estado asignado: Finalizado (después del fin)';
    END IF;
    
    -- Actualizar el estado solo si es diferente
    IF NEW.estado_agendamiento IS DISTINCT FROM nuevo_estado_id THEN
        NEW.estado_agendamiento := nuevo_estado_id;
        RAISE NOTICE 'Estado actualizado de % a %', OLD.estado_agendamiento, nuevo_estado_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. CREAR TRIGGER
DROP TRIGGER IF EXISTS trigger_actualizar_estado_reclutamiento ON reclutamientos;

CREATE TRIGGER trigger_actualizar_estado_reclutamiento
    BEFORE INSERT OR UPDATE ON reclutamientos
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_estado_reclutamiento_con_duracion();

-- 4. ACTUALIZAR ESTADOS EXISTENTES
SELECT '=== ACTUALIZANDO ESTADOS EXISTENTES ===' as info;

UPDATE reclutamientos 
SET estado_agendamiento = CASE
    WHEN fecha_sesion IS NULL THEN 
        (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Pendiente de agendamiento')
    WHEN NOW() < fecha_sesion THEN 
        (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Pendiente')
    WHEN NOW() >= fecha_sesion AND NOW() <= (fecha_sesion + (COALESCE(duracion_sesion, 60) || ' minutes')::INTERVAL) THEN 
        (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'En progreso')
    ELSE 
        (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado')
END
WHERE estado_agendamiento IS NULL OR estado_agendamiento != CASE
    WHEN fecha_sesion IS NULL THEN 
        (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Pendiente de agendamiento')
    WHEN NOW() < fecha_sesion THEN 
        (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Pendiente')
    WHEN NOW() >= fecha_sesion AND NOW() <= (fecha_sesion + (COALESCE(duracion_sesion, 60) || ' minutes')::INTERVAL) THEN 
        (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'En progreso')
    ELSE 
        (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado')
END;

-- 5. VERIFICAR RESULTADOS
SELECT '=== VERIFICANDO RESULTADOS ===' as info;
SELECT 
    r.id,
    r.fecha_sesion,
    r.duracion_sesion,
    r.fecha_sesion + (COALESCE(r.duracion_sesion, 60) || ' minutes')::INTERVAL as fecha_fin_sesion,
    NOW() as fecha_actual,
    ea.nombre as estado_actual,
    CASE
        WHEN r.fecha_sesion IS NULL THEN 'Pendiente de agendamiento'
        WHEN NOW() < r.fecha_sesion THEN 'Pendiente'
        WHEN NOW() >= r.fecha_sesion AND NOW() <= (r.fecha_sesion + (COALESCE(r.duracion_sesion, 60) || ' minutes')::INTERVAL) THEN 'En progreso'
        ELSE 'Finalizado'
    END as estado_calculado
FROM reclutamientos r
LEFT JOIN estado_agendamiento_cat ea ON r.estado_agendamiento = ea.id
ORDER BY r.fecha_sesion DESC
LIMIT 10;

-- 6. MOSTRAR RESUMEN FINAL
SELECT '=== RESUMEN FINAL ===' as info;
SELECT 
    ea.nombre as estado,
    COUNT(*) as cantidad
FROM reclutamientos r
LEFT JOIN estado_agendamiento_cat ea ON r.estado_agendamiento = ea.id
GROUP BY ea.nombre, ea.id
ORDER BY ea.id; 