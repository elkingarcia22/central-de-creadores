-- ====================================
-- TRIGGER FINAL PARA CREAR RECLUTAMIENTOS
-- ====================================

-- Verificar estructura real de las tablas
SELECT '=== VERIFICANDO ESTRUCTURA REAL ===' as info;

-- Verificar tabla participantes (estructura real)
SELECT '--- TABLA PARTICIPANTES (ESTRUCTURA REAL) ---' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'participantes' 
AND table_schema = 'public'
ORDER BY ordinal_position;

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
SELECT '=== VERIFICANDO DATOS EXISTENTES ===' as info;

-- Contar participantes
SELECT '--- TOTAL PARTICIPANTES ---' as info;
SELECT COUNT(*) as total_participantes FROM participantes;

-- Contar estados de agendamiento
SELECT '--- TOTAL ESTADOS AGENDAMIENTO ---' as info;
SELECT COUNT(*) as total_estados FROM estado_agendamiento_cat;

-- Ver participantes existentes
SELECT '--- PARTICIPANTES EXISTENTES ---' as info;
SELECT id, nombre, estado_participante FROM participantes LIMIT 5;

-- Ver estados de agendamiento disponibles
SELECT '--- ESTADOS DE AGENDAMIENTO DISPONIBLES ---' as info;
SELECT id, nombre FROM estado_agendamiento_cat LIMIT 10;

-- ====================================
-- CREAR DATOS POR DEFECTO SI ES NECESARIO
-- ====================================

-- Crear un participante por defecto si no existe ninguno
DO $$
DECLARE
    participante_default_id uuid;
    usuario_actual uuid;
BEGIN
    -- Verificar si hay participantes
    IF (SELECT COUNT(*) FROM participantes) = 0 THEN
        RAISE NOTICE 'No hay participantes, creando uno por defecto...';
        
        -- Obtener usuario actual
        SELECT id INTO usuario_actual 
        FROM auth.users 
        LIMIT 1;
        
        -- Crear un participante por defecto con la estructura real
        INSERT INTO participantes (
            id,
            nombre,
            rol_empresa_id,
            kam_id,
            estado_participante,
            created_at,
            updated_at,
            creado_por
        ) VALUES (
            gen_random_uuid(),
            'Participante Por Asignar',
            NULL, -- rol_empresa_id
            usuario_actual, -- kam_id (usar usuario actual)
            NULL, -- estado_participante
            NOW(),
            NOW(),
            usuario_actual
        ) RETURNING id INTO participante_default_id;
        
        RAISE NOTICE 'Participante por defecto creado con ID: %', participante_default_id;
    ELSE
        RAISE NOTICE 'Ya existen participantes en la tabla';
    END IF;
END $$;

-- Crear un estado de agendamiento por defecto si no existe ninguno
DO $$
DECLARE
    estado_default_id uuid;
BEGIN
    -- Verificar si hay estados de agendamiento
    IF (SELECT COUNT(*) FROM estado_agendamiento_cat) = 0 THEN
        RAISE NOTICE 'No hay estados de agendamiento, creando uno por defecto...';
        
        -- Crear un estado por defecto
        INSERT INTO estado_agendamiento_cat (
            id,
            nombre,
            descripcion,
            color
        ) VALUES (
            gen_random_uuid(),
            'Pendiente',
            'Reclutamiento pendiente de asignación',
            '#f59e0b'
        ) RETURNING id INTO estado_default_id;
        
        RAISE NOTICE 'Estado por defecto creado con ID: %', estado_default_id;
    ELSE
        RAISE NOTICE 'Ya existen estados de agendamiento en la tabla';
    END IF;
END $$;

-- ====================================
-- TRIGGER FINAL
-- ====================================

-- Función final que funciona con la estructura real
CREATE OR REPLACE FUNCTION crear_reclutamiento_por_agendar_final()
RETURNS TRIGGER AS $$
DECLARE
    usuario_actual uuid;
    participante_default_id uuid;
    estado_default_id uuid;
BEGIN
    -- Solo ejecutar si el estado cambió a 'por_agendar'
    IF NEW.estado = 'por_agendar' AND (OLD.estado IS NULL OR OLD.estado != 'por_agendar') THEN
        
        -- Obtener el usuario actual
        SELECT id INTO usuario_actual 
        FROM auth.users 
        LIMIT 1;
        
        -- Obtener un participante por defecto (el primero disponible)
        SELECT id INTO participante_default_id 
        FROM participantes 
        LIMIT 1;
        
        -- Obtener un estado de agendamiento por defecto (el primero disponible)
        SELECT id INTO estado_default_id 
        FROM estado_agendamiento_cat 
        LIMIT 1;
        
        -- Verificar que la investigación tenga libreto antes de crear el reclutamiento
        IF EXISTS (
            SELECT 1 
            FROM libretos_investigacion 
            WHERE investigacion_id = NEW.id
        ) THEN
            
            -- Verificar que tenemos los datos necesarios
            IF participante_default_id IS NULL THEN
                RAISE EXCEPTION 'No hay participantes disponibles para crear el reclutamiento';
            END IF;
            
            IF estado_default_id IS NULL THEN
                RAISE EXCEPTION 'No hay estados de agendamiento disponibles';
            END IF;
            
            -- Crear registro en reclutamientos con datos válidos
            INSERT INTO reclutamientos (
                investigacion_id,
                participantes_id,
                fecha_asignado,
                reclutador_id,
                creado_por,
                estado_agendamiento
            ) VALUES (
                NEW.id,
                participante_default_id,  -- Usar participante real
                NOW(),
                usuario_actual,
                usuario_actual,
                estado_default_id  -- Usar estado real
            );
            
            RAISE NOTICE 'Reclutamiento creado automáticamente para investigación: %', NEW.nombre;
        ELSE
            RAISE NOTICE 'Investigación % no tiene libreto, no se creará reclutamiento automático', NEW.nombre;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger final
DROP TRIGGER IF EXISTS trigger_crear_reclutamiento_por_agendar ON investigaciones;

CREATE TRIGGER trigger_crear_reclutamiento_por_agendar
    AFTER INSERT OR UPDATE ON investigaciones
    FOR EACH ROW
    EXECUTE FUNCTION crear_reclutamiento_por_agendar_final();

-- ====================================
-- PROCESAR INVESTIGACIONES EXISTENTES
-- ====================================

-- Crear reclutamientos para investigaciones que ya están en 'por_agendar' pero no tienen reclutamiento
DO $$
DECLARE
    investigacion_record RECORD;
    usuario_actual uuid;
    participante_default_id uuid;
    estado_default_id uuid;
BEGIN
    -- Obtener usuario actual
    SELECT id INTO usuario_actual 
    FROM auth.users 
    LIMIT 1;
    
    -- Obtener participante por defecto
    SELECT id INTO participante_default_id 
    FROM participantes 
    LIMIT 1;
    
    -- Obtener estado por defecto
    SELECT id INTO estado_default_id 
    FROM estado_agendamiento_cat 
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
            participante_default_id,
            NOW(),
            usuario_actual,
            usuario_actual,
            estado_default_id
        );
        
        RAISE NOTICE 'Reclutamiento creado para investigación existente: %', investigacion_record.nombre;
    END LOOP;
END $$;

-- ====================================
-- VERIFICAR RESULTADO FINAL
-- ====================================

-- Mostrar el estado final
SELECT '=== ESTADO FINAL ===' as info;
SELECT 
    'Participantes' as tabla,
    COUNT(*) as total
FROM participantes
UNION ALL
SELECT 
    'Estados Agendamiento' as tabla,
    COUNT(*) as total
FROM estado_agendamiento_cat
UNION ALL
SELECT 
    'Reclutamientos' as tabla,
    COUNT(*) as total
FROM reclutamientos;

-- Mostrar investigaciones con su estado de reclutamiento
SELECT '=== INVESTIGACIONES Y RECLUTAMIENTOS ===' as info;
SELECT 
    i.id,
    i.nombre,
    i.estado,
    CASE 
        WHEN r.id IS NULL THEN 'SIN RECLUTAMIENTO'
        ELSE 'CON RECLUTAMIENTO'
    END as tiene_reclutamiento,
    r.fecha_asignado,
    r.participantes_id
FROM investigaciones i
LEFT JOIN reclutamientos r ON i.id = r.investigacion_id
WHERE i.estado = 'por_agendar'
ORDER BY i.nombre; 