-- ====================================
-- TRIGGER FINAL CON ESTRUCTURA REAL
-- ====================================

-- Verificar datos existentes
SELECT '=== VERIFICANDO DATOS EXISTENTES ===' as info;

SELECT 'Usuarios' as tabla, COUNT(*) as total FROM usuarios;

SELECT 'Participantes' as tabla, COUNT(*) as total FROM participantes;

SELECT 'Estados Agendamiento' as tabla, COUNT(*) as total FROM estado_agendamiento_cat;

SELECT 'Reclutamientos' as tabla, COUNT(*) as total FROM reclutamientos;

-- ====================================
-- CREAR DATOS POR DEFECTO SI ES NECESARIO
-- ====================================

-- Crear un usuario por defecto si no existe ninguno
DO $$
DECLARE
    usuario_default_id uuid;
    auth_user_id uuid;
BEGIN
    -- Verificar si hay usuarios
    IF (SELECT COUNT(*) FROM usuarios) = 0 THEN
        RAISE NOTICE 'No hay usuarios, creando uno por defecto...';
        
        -- Obtener un usuario de auth.users
        SELECT id INTO auth_user_id 
        FROM auth.users 
        LIMIT 1;
        
        -- Crear un usuario por defecto con la estructura real
        INSERT INTO usuarios (
            id,
            nombre,
            correo,
            foto_url,
            activo,
            rol_plataforma,
            borrado_manual
        ) VALUES (
            auth_user_id,
            'Administrador Sistema',
            'admin@empresa.com',
            NULL,
            true,
            NULL,
            false
        ) RETURNING id INTO usuario_default_id;
        
        RAISE NOTICE 'Usuario por defecto creado con ID: %', usuario_default_id;
    ELSE
        RAISE NOTICE 'Ya existen usuarios en la tabla';
    END IF;
END $$;

-- Crear un participante por defecto si no existe ninguno
DO $$
DECLARE
    participante_default_id uuid;
    usuario_actual uuid;
BEGIN
    -- Verificar si hay participantes
    IF (SELECT COUNT(*) FROM participantes) = 0 THEN
        RAISE NOTICE 'No hay participantes, creando uno por defecto...';
        
        -- Obtener un usuario de la tabla usuarios
        SELECT id INTO usuario_actual 
        FROM usuarios 
        WHERE activo = true
        LIMIT 1;
        
        -- Si no hay usuarios, crear uno primero
        IF usuario_actual IS NULL THEN
            -- Obtener de auth.users
            SELECT id INTO usuario_actual 
            FROM auth.users 
            LIMIT 1;
            
            -- Crear usuario en tabla usuarios
            INSERT INTO usuarios (
                id,
                nombre,
                correo,
                activo,
                borrado_manual
            ) VALUES (
                usuario_actual,
                'Administrador Sistema',
                'admin@empresa.com',
                true,
                false
            );
        END IF;
        
        -- Crear un participante por defecto con la estructura real
        INSERT INTO participantes (
            id,
            nombre,
            rol_empresa_id,
            doleres_necesidades,
            descripción,
            kam_id,
            empresa_id,
            fecha_ultima_participacion,
            total_participaciones,
            created_at,
            updated_at,
            creado_por,
            productos_relacionados,
            estado_participante
        ) VALUES (
            gen_random_uuid(),
            'Participante Por Asignar',
            NULL,
            NULL,
            'Participante temporal para reclutamientos automáticos',
            usuario_actual,
            NULL,
            NULL,
            0,
            NOW(),
            NOW(),
            usuario_actual,
            NULL,
            NULL
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
        
        -- Crear un estado por defecto con la estructura real
        INSERT INTO estado_agendamiento_cat (
            id,
            nombre,
            activo
        ) VALUES (
            gen_random_uuid(),
            'Pendiente',
            true
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
CREATE OR REPLACE FUNCTION crear_reclutamiento_por_agendar_real()
RETURNS TRIGGER AS $$
DECLARE
    usuario_actual uuid;
    participante_default_id uuid;
    estado_default_id uuid;
BEGIN
    -- Solo ejecutar si el estado cambió a 'por_agendar'
    IF NEW.estado = 'por_agendar' AND (OLD.estado IS NULL OR OLD.estado != 'por_agendar') THEN
        
        -- Obtener un usuario activo de la tabla usuarios
        SELECT id INTO usuario_actual 
        FROM usuarios 
        WHERE activo = true
        LIMIT 1;
        
        -- Si no hay usuarios activos, crear uno
        IF usuario_actual IS NULL THEN
            -- Obtener de auth.users
            SELECT id INTO usuario_actual 
            FROM auth.users 
            LIMIT 1;
            
            -- Crear usuario en tabla usuarios
            INSERT INTO usuarios (
                id,
                nombre,
                correo,
                activo,
                borrado_manual
            ) VALUES (
                usuario_actual,
                'Administrador Sistema',
                'admin@empresa.com',
                true,
                false
            );
        END IF;
        
        -- Obtener un participante por defecto
        SELECT id INTO participante_default_id 
        FROM participantes 
        LIMIT 1;
        
        -- Obtener un estado de agendamiento activo
        SELECT id INTO estado_default_id 
        FROM estado_agendamiento_cat 
        WHERE activo = true
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
                fecha_sesion,
                reclutador_id,
                creado_por,
                estado_agendamiento
            ) VALUES (
                NEW.id,
                participante_default_id,
                NOW(),
                NULL,
                usuario_actual,
                usuario_actual,
                estado_default_id
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
    EXECUTE FUNCTION crear_reclutamiento_por_agendar_real();

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
    -- Obtener usuario activo
    SELECT id INTO usuario_actual 
    FROM usuarios 
    WHERE activo = true
    LIMIT 1;
    
    -- Si no hay usuarios activos, crear uno
    IF usuario_actual IS NULL THEN
        SELECT id INTO usuario_actual 
        FROM auth.users 
        LIMIT 1;
        
        INSERT INTO usuarios (
            id,
            nombre,
            correo,
            activo,
            borrado_manual
        ) VALUES (
            usuario_actual,
            'Administrador Sistema',
            'admin@empresa.com',
            true,
            false
        );
    END IF;
    
    -- Obtener participante por defecto
    SELECT id INTO participante_default_id 
    FROM participantes 
    LIMIT 1;
    
    -- Obtener estado por defecto
    SELECT id INTO estado_default_id 
    FROM estado_agendamiento_cat 
    WHERE activo = true
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
            fecha_sesion,
            reclutador_id,
            creado_por,
            estado_agendamiento
        ) VALUES (
            investigacion_record.id,
            participante_default_id,
            NOW(),
            NULL,
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

SELECT 'Usuarios' as tabla, COUNT(*) as total FROM usuarios;

SELECT 'Participantes' as tabla, COUNT(*) as total FROM participantes;

SELECT 'Estados Agendamiento' as tabla, COUNT(*) as total FROM estado_agendamiento_cat;

SELECT 'Reclutamientos' as tabla, COUNT(*) as total FROM reclutamientos;

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