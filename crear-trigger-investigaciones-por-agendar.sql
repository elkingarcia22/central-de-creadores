-- ====================================
-- TRIGGER PARA CREAR RECLUTAMIENTOS AUTOMÁTICAMENTE
-- ====================================

-- Función que se ejecutará cuando una investigación cambie a estado 'por_agendar'
CREATE OR REPLACE FUNCTION crear_reclutamiento_por_agendar()
RETURNS TRIGGER AS $$
DECLARE
    usuario_actual uuid;
BEGIN
    -- Solo ejecutar si el estado cambió a 'por_agendar'
    IF NEW.estado = 'por_agendar' AND (OLD.estado IS NULL OR OLD.estado != 'por_agendar') THEN
        
        -- Obtener el usuario actual (usar el primer usuario disponible como reclutador por defecto)
        SELECT id INTO usuario_actual 
        FROM auth.users 
        LIMIT 1;
        
        -- Verificar que la investigación tenga libreto antes de crear el reclutamiento
        IF EXISTS (
            SELECT 1 
            FROM libretos_investigacion 
            WHERE investigacion_id = NEW.id
        ) THEN
            
            -- Crear registro en reclutamientos
            INSERT INTO reclutamientos (
                investigacion_id,
                participantes_id,  -- Usar un UUID generado como placeholder
                fecha_asignado,
                reclutador_id,
                creado_por,
                estado_agendamiento  -- NULL por ahora, se asignará después
            ) VALUES (
                NEW.id,
                gen_random_uuid(),  -- Placeholder para participantes_id
                NOW(),
                usuario_actual,
                usuario_actual,
                NULL  -- estado_agendamiento se asignará cuando se configure
            );
            
            RAISE NOTICE 'Reclutamiento creado automáticamente para investigación: %', NEW.nombre;
        ELSE
            RAISE NOTICE 'Investigación % no tiene libreto, no se creará reclutamiento automático', NEW.nombre;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger que se ejecuta después de INSERT o UPDATE en investigaciones
DROP TRIGGER IF EXISTS trigger_crear_reclutamiento_por_agendar ON investigaciones;

CREATE TRIGGER trigger_crear_reclutamiento_por_agendar
    AFTER INSERT OR UPDATE ON investigaciones
    FOR EACH ROW
    EXECUTE FUNCTION crear_reclutamiento_por_agendar();

-- ====================================
-- ACTUALIZAR INVESTIGACIONES EXISTENTES A 'por_agendar'
-- ====================================

-- Verificar investigaciones que ya están en estado 'por_agendar' pero no tienen reclutamiento
SELECT '=== INVESTIGACIONES POR AGENDAR SIN RECLUTAMIENTO ===' as info;
SELECT 
    i.id,
    i.nombre,
    i.estado,
    CASE 
        WHEN r.id IS NULL THEN 'SIN RECLUTAMIENTO'
        ELSE 'CON RECLUTAMIENTO'
    END as tiene_reclutamiento
FROM investigaciones i
LEFT JOIN reclutamientos r ON i.id = r.investigacion_id
WHERE i.estado = 'por_agendar'
ORDER BY i.nombre;

-- Crear reclutamientos para investigaciones que ya están en 'por_agendar' pero no tienen reclutamiento
DO $$
DECLARE
    investigacion_record RECORD;
    usuario_actual uuid;
BEGIN
    -- Obtener usuario actual
    SELECT id INTO usuario_actual 
    FROM auth.users 
    LIMIT 1;
    
    -- Para cada investigación en estado 'por_agendar' que no tenga reclutamiento
    FOR investigacion_record IN 
        SELECT i.id, i.nombre
        FROM investigaciones i
        LEFT JOIN reclutamientos r ON i.id = r.investigacion_id
        WHERE i.estado = 'por_agendar' 
        AND r.id IS NULL
        AND EXISTS (
            SELECT 1 
            FROM libretos_investigacion 
            WHERE investigacion_id = i.id
        )
    LOOP
        -- Crear reclutamiento
        INSERT INTO reclutamientos (
            investigacion_id,
            participantes_id,
            fecha_asignado,
            reclutador_id,
            creado_por,
            estado_agendamiento
        ) VALUES (
            investigacion_record.id,
            gen_random_uuid(),
            NOW(),
            usuario_actual,
            usuario_actual,
            NULL
        );
        
        RAISE NOTICE 'Reclutamiento creado para investigación existente: %', investigacion_record.nombre;
    END LOOP;
END $$;

-- ====================================
-- VERIFICAR RESULTADO
-- ====================================

-- Mostrar todas las investigaciones con su estado de reclutamiento
SELECT '=== ESTADO FINAL DE INVESTIGACIONES Y RECLUTAMIENTOS ===' as info;
SELECT 
    i.id,
    i.nombre,
    i.estado,
    CASE 
        WHEN r.id IS NULL THEN 'SIN RECLUTAMIENTO'
        ELSE 'CON RECLUTAMIENTO'
    END as tiene_reclutamiento,
    r.fecha_asignado,
    r.reclutador_id
FROM investigaciones i
LEFT JOIN reclutamientos r ON i.id = r.investigacion_id
WHERE i.estado = 'por_agendar'
ORDER BY i.nombre;

-- Contar total de reclutamientos
SELECT '=== TOTAL DE RECLUTAMIENTOS ===' as info;
SELECT COUNT(*) as total_reclutamientos FROM reclutamientos; 