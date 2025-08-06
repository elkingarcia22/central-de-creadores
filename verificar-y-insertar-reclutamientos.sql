-- ====================================
-- VERIFICAR E INSERTAR DATOS EN RECLUTAMIENTOS
-- ====================================

-- 1. Verificar si la tabla reclutamientos existe y su estructura
SELECT '=== VERIFICANDO TABLA RECLUTAMIENTOS ===' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'reclutamientos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar si hay datos en la tabla
SELECT '=== VERIFICANDO DATOS EXISTENTES ===' as info;
SELECT COUNT(*) as total_reclutamientos FROM reclutamientos;

-- 3. Verificar investigaciones disponibles con estado 'por_agendar'
SELECT '=== INVESTIGACIONES POR AGENDAR ===' as info;
SELECT 
    id,
    nombre,
    estado,
    fecha_inicio,
    fecha_fin
FROM investigaciones 
WHERE estado = 'por_agendar'
ORDER BY nombre;

-- 4. Verificar usuarios disponibles para usar como reclutadores
SELECT '=== USUARIOS DISPONIBLES ===' as info;
SELECT 
    id,
    email,
    created_at
FROM auth.users 
LIMIT 5;

-- 5. Insertar datos de prueba si no hay reclutamientos
DO $$
DECLARE
    investigacion_id uuid;
    usuario_id uuid;
    estado_agendamiento_id uuid;
BEGIN
    -- Verificar si ya hay reclutamientos
    IF (SELECT COUNT(*) FROM reclutamientos) = 0 THEN
        RAISE NOTICE 'No hay reclutamientos, insertando datos de prueba...';
        
        -- Obtener una investigación con estado 'por_agendar'
        SELECT id INTO investigacion_id 
        FROM investigaciones 
        WHERE estado = 'por_agendar' 
        LIMIT 1;
        
        -- Obtener un usuario
        SELECT id INTO usuario_id 
        FROM auth.users 
        LIMIT 1;
        
        -- Obtener un estado de agendamiento (asumiendo que existe la tabla)
        SELECT id INTO estado_agendamiento_id 
        FROM estado_agendamiento_cat 
        LIMIT 1;
        
        -- Si no existe estado_agendamiento_cat, usar NULL
        IF estado_agendamiento_id IS NULL THEN
            estado_agendamiento_id := NULL;
        END IF;
        
        -- Insertar reclutamientos de prueba
        INSERT INTO reclutamientos (
            investigacion_id,
            participantes_id,
            fecha_asignado,
            fecha_sesion,
            reclutador_id,
            creado_por,
            estado_agendamiento
        ) VALUES 
        (
            investigacion_id,
            gen_random_uuid(), -- participantes_id (simulado)
            NOW(),
            NOW() + INTERVAL '7 days',
            usuario_id,
            usuario_id,
            estado_agendamiento_id
        ),
        (
            investigacion_id,
            gen_random_uuid(), -- participantes_id (simulado)
            NOW() - INTERVAL '1 day',
            NOW() + INTERVAL '3 days',
            usuario_id,
            usuario_id,
            estado_agendamiento_id
        );
        
        RAISE NOTICE 'Datos de prueba insertados correctamente';
    ELSE
        RAISE NOTICE 'Ya existen reclutamientos en la tabla';
    END IF;
END $$;

-- 6. Verificar los datos insertados
SELECT '=== RECLUTAMIENTOS DESPUÉS DE INSERCIÓN ===' as info;
SELECT 
    id,
    investigacion_id,
    participantes_id,
    fecha_asignado,
    fecha_sesion,
    reclutador_id,
    creado_por,
    estado_agendamiento
FROM reclutamientos
ORDER BY fecha_asignado DESC; 