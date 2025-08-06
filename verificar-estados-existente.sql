-- ====================================
-- VERIFICAR Y CORREGIR ESTADOS DE RECLUTAMIENTO
-- ====================================

-- 1. VERIFICAR ESTADOS EXISTENTES
SELECT '=== VERIFICANDO ESTADOS EXISTENTES ===' as info;
SELECT id, nombre, activo FROM estado_agendamiento_cat ORDER BY nombre;

-- 2. VERIFICAR SI EXISTE EL ESTADO "En progreso"
SELECT '=== VERIFICANDO ESTADO "En progreso" ===' as info;
SELECT id, nombre, activo FROM estado_agendamiento_cat WHERE nombre ILIKE '%progreso%';

-- 3. CREAR EL ESTADO "En progreso" SI NO EXISTE
SELECT '=== CREANDO ESTADO "En progreso" SI NO EXISTE ===' as info;
INSERT INTO estado_agendamiento_cat (id, nombre, activo, color, orden)
SELECT 
    gen_random_uuid(),
    'En progreso',
    true,
    '#10b981', -- Verde
    3
WHERE NOT EXISTS (
    SELECT 1 FROM estado_agendamiento_cat WHERE nombre = 'En progreso'
);

-- 4. VERIFICAR TRIGGERS EXISTENTES
SELECT '=== VERIFICANDO TRIGGERS EXISTENTES ===' as info;
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'reclutamientos';

-- 5. ELIMINAR TRIGGER EXISTENTE SI EXISTE
DROP TRIGGER IF EXISTS trigger_actualizar_estado_reclutamiento ON reclutamientos;

-- 6. CREAR FUNCIÓN MEJORADA
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
    estado_pendiente_agendamiento_id UUID;
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
    SELECT id INTO estado_pendiente_agendamiento_id FROM estado_agendamiento_cat WHERE nombre = 'Pendiente de agendamiento';
    
    -- Debug: Imprimir información
    RAISE NOTICE 'Fecha actual: %, Fecha sesión: %, Día actual: %', fecha_actual, fecha_sesion, fecha_actual_dia;
    
    -- Lógica de estados mejorada
    IF fecha_sesion IS NULL THEN
        -- Sin fecha de sesión = Pendiente de agendamiento
        nuevo_estado_id := estado_pendiente_agendamiento_id;
        RAISE NOTICE 'Estado asignado: Pendiente de agendamiento (sin fecha)';
    ELSIF fecha_sesion > fecha_actual THEN
        -- Fecha futura = Pendiente
        nuevo_estado_id := estado_pendiente_id;
        RAISE NOTICE 'Estado asignado: Pendiente (fecha futura)';
    ELSIF DATE(fecha_sesion) = fecha_actual_dia THEN
        -- Mismo día = En progreso
        nuevo_estado_id := estado_en_progreso_id;
        RAISE NOTICE 'Estado asignado: En progreso (mismo día)';
    ELSE
        -- Día anterior = Finalizado
        nuevo_estado_id := estado_finalizado_id;
        RAISE NOTICE 'Estado asignado: Finalizado (día anterior)';
    END IF;
    
    -- Actualizar el estado solo si es diferente
    IF NEW.estado_agendamiento IS DISTINCT FROM nuevo_estado_id THEN
        NEW.estado_agendamiento := nuevo_estado_id;
        RAISE NOTICE 'Estado actualizado de % a %', OLD.estado_agendamiento, nuevo_estado_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. CREAR TRIGGER
CREATE TRIGGER trigger_actualizar_estado_reclutamiento
    BEFORE INSERT OR UPDATE ON reclutamientos
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_estado_reclutamiento_automatico();

-- 8. ACTUALIZAR ESTADOS EXISTENTES
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

-- 9. VERIFICAR RESULTADOS
SELECT '=== VERIFICANDO RESULTADOS ===' as info;

SELECT 
    r.id,
    r.fecha_sesion,
    DATE(r.fecha_sesion) as fecha_solo,
    CURRENT_DATE as fecha_actual,
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

-- 10. MOSTRAR RESUMEN FINAL
SELECT '=== RESUMEN FINAL ===' as info;
SELECT 
    ea.nombre as estado,
    COUNT(*) as cantidad
FROM reclutamientos r
LEFT JOIN estado_agendamiento_cat ea ON r.estado_agendamiento = ea.id
GROUP BY ea.nombre, ea.id
ORDER BY ea.id; 