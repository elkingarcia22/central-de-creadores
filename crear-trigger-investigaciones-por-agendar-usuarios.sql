-- ====================================
-- TRIGGER CORREGIDO PARA MANEJAR USUARIOS
-- ====================================

-- Verificar estructura de tablas relacionadas
SELECT '=== VERIFICANDO ESTRUCTURA DE TABLAS ===' as info;

-- Verificar tabla usuarios
SELECT '--- TABLA USUARIOS ---' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
AND table_schema = 'public'
ORDER BY ordinal_position;

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

-- Contar usuarios
SELECT '--- TOTAL USUARIOS ---' as info;
SELECT COUNT(*) as total_usuarios FROM usuarios;

-- Contar participantes
SELECT '--- TOTAL PARTICIPANTES ---' as info;
SELECT COUNT(*) as total_participantes FROM participantes;

-- Contar estados de agendamiento
SELECT '--- TOTAL ESTADOS AGENDAMIENTO ---' as info;
SELECT COUNT(*) as total_estados FROM estado_agendamiento_cat;

-- Ver usuarios existentes
SELECT '--- USUARIOS EXISTENTES ---' as info;
SELECT id, email FROM usuarios LIMIT 5;

-- Ver participantes existentes
SELECT '--- PARTICIPANTES EXISTENTES ---' as info;
SELECT id, nombre FROM participantes LIMIT 5;

-- Ver estados de agendamiento disponibles
SELECT '--- ESTADOS DE AGENDAMIENTO DISPONIBLES ---' as info;
SELECT id, nombre FROM estado_agendamiento_cat LIMIT 10;

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
        
        -- Crear un usuario por defecto
        INSERT INTO usuarios (
            id,
            email,
            nombre,
            apellido,
            rol_empresa_id
        ) VALUES (
            auth_user_id,
            'admin@empresa.com',
            'Administrador',
            'Sistema',
            NULL
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
                email,
                nombre,
                apellido
            ) VALUES (
                usuario_actual,
                'admin@empresa.com',
                'Administrador',
                'Sistema'
            );
        END IF;
        
        -- Crear un participante por defecto
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
            NULL,
            usuario_actual,
            NULL,
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
-- TRIGGER CORREGIDO
-- ====================================

-- Función corregida que maneja correctamente la relación usuarios
CREATE OR REPLACE FUNCTION crear_reclutamiento_por_agendar_usuarios()
RETURNS TRIGGER AS $$
DECLARE
    usuario_actual uuid;
    participante_default_id uuid;
    estado_default_id uuid;
BEGIN
    -- Solo ejecutar si el estado cambió a 'por_agendar'
    IF NEW.estado = 'por_agendar' AND (OLD.estado IS NULL OR OLD.estado != 'por_agendar') THEN
        
        -- Obtener un usuario de la tabla usuarios (no de auth.users)
        SELECT id INTO usuario_actual 
        FROM usuarios 
        LIMIT 1;
        
        -- Si no hay usuarios en la tabla usuarios, crear uno
        IF usuario_actual IS NULL THEN
            -- Obtener de auth.users
            SELECT id INTO usuario_actual 
            FROM auth.users 
            LIMIT 1;
            
            -- Crear usuario en tabla usuarios
            INSERT INTO usuarios (
                id,
                email,
                nombre,
                apellido
            ) VALUES (
                usuario_actual,
                'admin@empresa.com',
                'Administrador',
                'Sistema'
            );
        END IF;
        
        -- Obtener un participante por defecto
        SELECT id INTO participante_default_id 
        FROM participantes 
        LIMIT 1;
        
        -- Obtener un estado de agendamiento por defecto
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
                participante_default_id,
                NOW(),
                usuario_actual,  -- Usar usuario de tabla usuarios
                usuario_actual,  -- Usar usuario de tabla usuarios
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

-- Crear el trigger corregido
DROP TRIGGER IF EXISTS trigger_crear_reclutamiento_por_agendar ON investigaciones;

CREATE TRIGGER trigger_crear_reclutamiento_por_agendar
    AFTER INSERT OR UPDATE ON investigaciones
    FOR EACH ROW
    EXECUTE FUNCTION crear_reclutamiento_por_agendar_usuarios();

-- ====================================
-- VERIFICAR RESULTADO
-- ====================================

-- Mostrar el estado final
SELECT '=== ESTADO FINAL ===' as info;
SELECT 
    'Usuarios' as tabla,
    COUNT(*) as total
FROM usuarios
UNION ALL
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