-- ====================================
-- CONFIGURAR FLUJO DE ESTADOS RECLUTAMIENTO
-- ====================================

-- 1. VERIFICAR ESTRUCTURA ACTUAL
SELECT '=== VERIFICANDO ESTRUCTURA ACTUAL ===' as info;

-- Verificar tabla estado_agendamiento_cat
SELECT '--- TABLA ESTADO_AGENDAMIENTO_CAT ---' as info;
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'estado_agendamiento_cat' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar datos existentes
SELECT '--- DATOS EXISTENTES EN ESTADO_AGENDAMIENTO_CAT ---' as info;
SELECT * FROM estado_agendamiento_cat ORDER BY nombre;

-- 2. VERIFICAR QUE EXISTAN TODOS LOS ESTADOS NECESARIOS
SELECT '=== VERIFICANDO ESTADOS NECESARIOS ===' as info;

-- Verificar si existen todos los estados del flujo
SELECT 
    CASE 
        WHEN COUNT(*) = 5 THEN '✅ Todos los estados necesarios existen'
        ELSE '⚠️ Faltan algunos estados'
    END as estado_verificacion,
    COUNT(*) as total_estados
FROM estado_agendamiento_cat 
WHERE nombre IN (
    'Pendiente de agendamiento',
    'Pendiente', 
    'En progreso',
    'Finalizado',
    'Cancelado'
);

-- Mostrar estados existentes
SELECT '--- ESTADOS EXISTENTES ---' as info;
SELECT id, nombre, activo FROM estado_agendamiento_cat ORDER BY nombre;

-- 3. CREAR FUNCIÓN PARA ACTUALIZAR ESTADO AUTOMÁTICAMENTE
CREATE OR REPLACE FUNCTION actualizar_estado_reclutamiento_automatico()
RETURNS TRIGGER AS $$
DECLARE
    fecha_actual TIMESTAMP WITH TIME ZONE;
    estado_pendiente_id UUID;
    estado_en_progreso_id UUID;
    estado_finalizado_id UUID;
BEGIN
    -- Obtener fecha actual
    fecha_actual := NOW();
    
    -- Obtener IDs de estados
    SELECT id INTO estado_pendiente_id FROM estado_agendamiento_cat WHERE nombre = 'Pendiente';
    SELECT id INTO estado_en_progreso_id FROM estado_agendamiento_cat WHERE nombre = 'En progreso';
    SELECT id INTO estado_finalizado_id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado';
    
    -- Si se agregó un participante (fecha_sesion se estableció), cambiar a "Pendiente"
    IF NEW.fecha_sesion IS NOT NULL AND OLD.fecha_sesion IS NULL THEN
        NEW.estado_agendamiento := estado_pendiente_id;
        RAISE NOTICE 'Estado cambiado a Pendiente por agregar participante';
    END IF;
    
    -- Si la fecha de sesión es hoy, cambiar a "En progreso"
    IF NEW.fecha_sesion IS NOT NULL AND 
       DATE(NEW.fecha_sesion) = DATE(fecha_actual) AND
       NEW.estado_agendamiento = estado_pendiente_id THEN
        NEW.estado_agendamiento := estado_en_progreso_id;
        RAISE NOTICE 'Estado cambiado a En progreso por fecha de sesión';
    END IF;
    
    -- Si la fecha de sesión ya pasó, cambiar a "Finalizado"
    IF NEW.fecha_sesion IS NOT NULL AND 
       NEW.fecha_sesion < fecha_actual AND
       NEW.estado_agendamiento IN (estado_pendiente_id, estado_en_progreso_id) THEN
        NEW.estado_agendamiento := estado_finalizado_id;
        RAISE NOTICE 'Estado cambiado a Finalizado por fecha pasada';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. CREAR TRIGGER PARA ACTUALIZACIÓN AUTOMÁTICA
DROP TRIGGER IF EXISTS trigger_actualizar_estado_reclutamiento ON reclutamientos;

CREATE TRIGGER trigger_actualizar_estado_reclutamiento
    BEFORE UPDATE ON reclutamientos
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_estado_reclutamiento_automatico();

-- 5. CREAR FUNCIÓN PARA ACTUALIZAR ESTADOS EXISTENTES
CREATE OR REPLACE FUNCTION actualizar_estados_reclutamiento_existentes()
RETURNS void AS $$
DECLARE
    rec RECORD;
    fecha_actual TIMESTAMP WITH TIME ZONE;
    estado_pendiente_id UUID;
    estado_en_progreso_id UUID;
    estado_finalizado_id UUID;
BEGIN
    fecha_actual := NOW();
    
    -- Obtener IDs de estados
    SELECT id INTO estado_pendiente_id FROM estado_agendamiento_cat WHERE nombre = 'Pendiente';
    SELECT id INTO estado_en_progreso_id FROM estado_agendamiento_cat WHERE nombre = 'En progreso';
    SELECT id INTO estado_finalizado_id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado';
    
    -- Actualizar reclutamientos existentes
    FOR rec IN 
        SELECT id, fecha_sesion, estado_agendamiento 
        FROM reclutamientos 
        WHERE fecha_sesion IS NOT NULL
    LOOP
        -- Si tiene fecha de sesión pero no está en estado pendiente, ponerlo en pendiente
        IF rec.estado_agendamiento IS NULL OR rec.estado_agendamiento NOT IN (estado_pendiente_id, estado_en_progreso_id, estado_finalizado_id) THEN
            UPDATE reclutamientos 
            SET estado_agendamiento = estado_pendiente_id 
            WHERE id = rec.id;
            RAISE NOTICE 'Reclutamiento % actualizado a Pendiente', rec.id;
        END IF;
        
        -- Si la fecha de sesión es hoy, poner en progreso
        IF DATE(rec.fecha_sesion) = DATE(fecha_actual) AND rec.estado_agendamiento = estado_pendiente_id THEN
            UPDATE reclutamientos 
            SET estado_agendamiento = estado_en_progreso_id 
            WHERE id = rec.id;
            RAISE NOTICE 'Reclutamiento % actualizado a En progreso', rec.id;
        END IF;
        
        -- Si la fecha de sesión ya pasó, poner finalizado
        IF rec.fecha_sesion < fecha_actual AND rec.estado_agendamiento IN (estado_pendiente_id, estado_en_progreso_id) THEN
            UPDATE reclutamientos 
            SET estado_agendamiento = estado_finalizado_id 
            WHERE id = rec.id;
            RAISE NOTICE 'Reclutamiento % actualizado a Finalizado', rec.id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 6. EJECUTAR ACTUALIZACIÓN DE ESTADOS EXISTENTES
SELECT '=== ACTUALIZANDO ESTADOS EXISTENTES ===' as info;
SELECT actualizar_estados_reclutamiento_existentes();

-- 7. VERIFICAR RESULTADO FINAL
SELECT '=== VERIFICACIÓN FINAL ===' as info;

-- Mostrar reclutamientos con sus estados
SELECT 
    r.id,
    r.investigacion_id,
    r.fecha_sesion,
    eac.nombre as estado_actual
FROM reclutamientos r
LEFT JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
ORDER BY r.fecha_sesion;

-- Mostrar estadísticas
SELECT 
    eac.nombre as estado,
    COUNT(r.id) as total_reclutamientos
FROM estado_agendamiento_cat eac
LEFT JOIN reclutamientos r ON eac.id = r.estado_agendamiento
GROUP BY eac.id, eac.nombre
ORDER BY eac.nombre;

-- 8. REFRESCAR CACHE DE ESQUEMAS
NOTIFY pgrst, 'reload schema';

SELECT 'Flujo de estados de reclutamiento configurado exitosamente' as mensaje; 