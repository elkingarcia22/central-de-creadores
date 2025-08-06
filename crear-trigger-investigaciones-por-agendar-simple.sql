-- ====================================
-- TRIGGER SIMPLIFICADO PARA CREAR RECLUTAMIENTOS
-- ====================================

-- Verificar estructura de tablas sin asumir columnas específicas
SELECT '=== VERIFICANDO ESTRUCTURA DE TABLAS ===' as info;

-- Verificar tabla participantes
SELECT '--- TABLA PARTICIPANTES ---' as info;
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

-- Verificar restricciones de clave foránea en reclutamientos
SELECT '--- RESTRICCIONES DE CLAVE FORÁNEA EN RECLUTAMIENTOS ---' as info;
SELECT 
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'reclutamientos';

-- Verificar datos existentes
SELECT '=== VERIFICANDO DATOS EXISTENTES ===' as info;

-- Contar participantes
SELECT '--- TOTAL PARTICIPANTES ---' as info;
SELECT COUNT(*) as total_participantes FROM participantes;

-- Contar estados de agendamiento
SELECT '--- TOTAL ESTADOS AGENDAMIENTO ---' as info;
SELECT COUNT(*) as total_estados FROM estado_agendamiento_cat;

-- Ver algunos participantes de ejemplo (usando solo columnas que sabemos que existen)
SELECT '--- PARTICIPANTES DE EJEMPLO ---' as info;
SELECT id FROM participantes LIMIT 5;

-- Ver estados de agendamiento disponibles
SELECT '--- ESTADOS DE AGENDAMIENTO DISPONIBLES ---' as info;
SELECT id FROM estado_agendamiento_cat LIMIT 10;

-- ====================================
-- CREAR DATOS POR DEFECTO SI ES NECESARIO
-- ====================================

-- Crear un participante por defecto si no existe ninguno
DO $$
DECLARE
    participante_default_id uuid;
BEGIN
    -- Verificar si hay participantes
    IF (SELECT COUNT(*) FROM participantes) = 0 THEN
        RAISE NOTICE 'No hay participantes, creando uno por defecto...';
        
        -- Crear un participante por defecto (solo con campos básicos)
        INSERT INTO participantes (
            id
        ) VALUES (
            gen_random_uuid()
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
        
        -- Crear un estado por defecto (solo con campos básicos)
        INSERT INTO estado_agendamiento_cat (
            id
        ) VALUES (
            gen_random_uuid()
        ) RETURNING id INTO estado_default_id;
        
        RAISE NOTICE 'Estado por defecto creado con ID: %', estado_default_id;
    ELSE
        RAISE NOTICE 'Ya existen estados de agendamiento en la tabla';
    END IF;
END $$;

-- ====================================
-- TRIGGER SIMPLIFICADO
-- ====================================

-- Función simplificada que solo usa campos que sabemos que existen
CREATE OR REPLACE FUNCTION crear_reclutamiento_por_agendar_simple()
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

-- Crear el trigger simplificado
DROP TRIGGER IF EXISTS trigger_crear_reclutamiento_por_agendar ON investigaciones;

CREATE TRIGGER trigger_crear_reclutamiento_por_agendar
    AFTER INSERT OR UPDATE ON investigaciones
    FOR EACH ROW
    EXECUTE FUNCTION crear_reclutamiento_por_agendar_simple();

-- ====================================
-- VERIFICAR RESULTADO
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