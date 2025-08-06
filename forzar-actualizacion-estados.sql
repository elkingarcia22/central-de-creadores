-- ====================================
-- FORZAR ACTUALIZACIÓN DE ESTADOS DE RECLUTAMIENTO (SOLUCIÓN DINÁMICA)
-- ====================================

-- 1. VERIFICAR ESTADOS DISPONIBLES
SELECT '=== ESTADOS DISPONIBLES ===' as info;
SELECT id, nombre, activo FROM estado_agendamiento_cat ORDER BY nombre;

-- 2. VERIFICAR RECLUTAMIENTOS ACTUALES
SELECT '=== RECLUTAMIENTOS ACTUALES ===' as info;
SELECT 
    r.id,
    r.fecha_sesion,
    r.fecha_sesion AT TIME ZONE 'UTC' AT TIME ZONE 'America/Bogota' as fecha_sesion_colombia,
    CURRENT_DATE AT TIME ZONE 'America/Bogota' as fecha_actual_colombia,
    ea.nombre as estado_actual,
    CASE
        WHEN r.fecha_sesion IS NULL THEN 'Pendiente de agendamiento'
        WHEN r.fecha_sesion > NOW() THEN 'Pendiente'
        WHEN DATE(r.fecha_sesion AT TIME ZONE 'UTC' AT TIME ZONE 'America/Bogota') = CURRENT_DATE AT TIME ZONE 'America/Bogota' THEN 'En progreso'
        ELSE 'Finalizado'
    END as estado_calculado
FROM reclutamientos r
LEFT JOIN estado_agendamiento_cat ea ON r.estado_agendamiento = ea.id
ORDER BY r.fecha_sesion DESC
LIMIT 10;

-- 3. OBTENER IDS DE ESTADOS Y ACTUALIZAR
SELECT '=== OBTENIENDO IDS DE ESTADOS ===' as info;
DO $$
DECLARE
    estado_pendiente_id UUID;
    estado_en_progreso_id UUID;
    estado_finalizado_id UUID;
    estado_pendiente_agendamiento_id UUID;
    registros_actualizados INTEGER := 0;
    fecha_actual_colombia DATE;
BEGIN
    -- Obtener fecha actual en Colombia
    fecha_actual_colombia := CURRENT_DATE AT TIME ZONE 'America/Bogota';
    
    -- Obtener IDs de estados
    SELECT id INTO estado_pendiente_id FROM estado_agendamiento_cat WHERE nombre = 'Pendiente';
    SELECT id INTO estado_en_progreso_id FROM estado_agendamiento_cat WHERE nombre = 'En progreso';
    SELECT id INTO estado_finalizado_id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado';
    SELECT id INTO estado_pendiente_agendamiento_id FROM estado_agendamiento_cat WHERE nombre = 'Pendiente de agendamiento';
    
    RAISE NOTICE 'Fecha actual Colombia: %', fecha_actual_colombia;
    RAISE NOTICE 'Estado Pendiente ID: %', estado_pendiente_id;
    RAISE NOTICE 'Estado En progreso ID: %', estado_en_progreso_id;
    RAISE NOTICE 'Estado Finalizado ID: %', estado_finalizado_id;
    RAISE NOTICE 'Estado Pendiente de agendamiento ID: %', estado_pendiente_agendamiento_id;
    
    -- 4. ACTUALIZAR ESTADOS MANUALMENTE CON ZONA HORARIA COLOMBIA
    RAISE NOTICE '=== ACTUALIZANDO ESTADOS ===';
    
    -- Actualizar reclutamientos sin fecha
    UPDATE reclutamientos 
    SET estado_agendamiento = estado_pendiente_agendamiento_id
    WHERE fecha_sesion IS NULL AND estado_agendamiento != estado_pendiente_agendamiento_id;
    
    GET DIAGNOSTICS registros_actualizados = ROW_COUNT;
    RAISE NOTICE 'Reclutamientos sin fecha actualizados: %', registros_actualizados;
    
    -- Actualizar reclutamientos futuros
    UPDATE reclutamientos 
    SET estado_agendamiento = estado_pendiente_id
    WHERE fecha_sesion > NOW() AND estado_agendamiento != estado_pendiente_id;
    
    GET DIAGNOSTICS registros_actualizados = ROW_COUNT;
    RAISE NOTICE 'Reclutamientos futuros actualizados: %', registros_actualizados;
    
    -- Actualizar reclutamientos de hoy (En progreso) - USANDO ZONA HORARIA COLOMBIA
    UPDATE reclutamientos 
    SET estado_agendamiento = estado_en_progreso_id
    WHERE DATE(fecha_sesion AT TIME ZONE 'UTC' AT TIME ZONE 'America/Bogota') = fecha_actual_colombia 
    AND estado_agendamiento != estado_en_progreso_id;
    
    GET DIAGNOSTICS registros_actualizados = ROW_COUNT;
    RAISE NOTICE 'Reclutamientos de hoy actualizados: %', registros_actualizados;
    
    -- Actualizar reclutamientos pasados
    UPDATE reclutamientos 
    SET estado_agendamiento = estado_finalizado_id
    WHERE DATE(fecha_sesion AT TIME ZONE 'UTC' AT TIME ZONE 'America/Bogota') < fecha_actual_colombia 
    AND estado_agendamiento != estado_finalizado_id;
    
    GET DIAGNOSTICS registros_actualizados = ROW_COUNT;
    RAISE NOTICE 'Reclutamientos pasados actualizados: %', registros_actualizados;
    
END $$;

-- 5. VERIFICAR RESULTADOS DESPUÉS DE LA ACTUALIZACIÓN
SELECT '=== RESULTADOS DESPUÉS DE LA ACTUALIZACIÓN ===' as info;
SELECT 
    r.id,
    r.fecha_sesion,
    r.fecha_sesion AT TIME ZONE 'UTC' AT TIME ZONE 'America/Bogota' as fecha_sesion_colombia,
    CURRENT_DATE AT TIME ZONE 'America/Bogota' as fecha_actual_colombia,
    ea.nombre as estado_actual,
    CASE
        WHEN r.fecha_sesion IS NULL THEN 'Pendiente de agendamiento'
        WHEN r.fecha_sesion > NOW() THEN 'Pendiente'
        WHEN DATE(r.fecha_sesion AT TIME ZONE 'UTC' AT TIME ZONE 'America/Bogota') = CURRENT_DATE AT TIME ZONE 'America/Bogota' THEN 'En progreso'
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