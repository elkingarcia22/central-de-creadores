-- =====================================================
-- DIAGNÓSTICO DEL TRIGGER FRIEND AND FAMILY
-- =====================================================

-- 1. VERIFICAR SI EL TRIGGER ESTÁ ACTIVO
SELECT 
    'TRIGGER ACTIVO' as tipo,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_participantes_friend_family_trigger';

-- 2. VERIFICAR SI LA FUNCIÓN EXISTE Y ES VÁLIDA
SELECT 
    'FUNCIÓN' as tipo,
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'trigger_participantes_friend_family';

-- 3. VERIFICAR LA ESTRUCTURA DE LA TABLA RECLUTAMIENTOS
SELECT 
    'ESTRUCTURA RECLUTAMIENTOS' as tipo,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'reclutamientos' 
AND column_name IN ('participantes_friend_family_id', 'tipo_participante', 'estado_agendamiento')
ORDER BY ordinal_position;

-- 4. VERIFICAR LA ESTRUCTURA DE LA TABLA HISTORIAL
SELECT 
    'ESTRUCTURA HISTORIAL' as tipo,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'historial_participacion_participantes_friend_family'
ORDER BY ordinal_position;

-- 5. VERIFICAR ESTADOS DE AGENDAMIENTO DISPONIBLES
SELECT 
    'ESTADOS AGENDAMIENTO' as tipo,
    id,
    nombre
FROM estado_agendamiento_cat
ORDER BY nombre;

-- 6. VERIFICAR PARTICIPANTES FRIEND AND FAMILY EXISTENTES
SELECT 
    'PARTICIPANTES FRIEND AND FAMILY' as tipo,
    id,
    nombre,
    email,
    departamento_id
FROM participantes_friend_family
LIMIT 5;

-- 7. VERIFICAR INVESTIGACIONES DISPONIBLES
SELECT 
    'INVESTIGACIONES' as tipo,
    id,
    nombre
FROM investigaciones
LIMIT 5;

-- 8. VERIFICAR USUARIOS DISPONIBLES
SELECT 
    'USUARIOS' as tipo,
    id,
    full_name
FROM usuarios
LIMIT 5;

-- 9. PROBAR INSERCIÓN MANUAL DE RECLUTAMIENTO
-- (Esto nos ayudará a identificar el problema exacto)
DO $$
DECLARE
    participante_id UUID;
    investigacion_id UUID;
    usuario_id UUID;
    estado_id UUID;
BEGIN
    -- Obtener un participante Friend and Family
    SELECT id INTO participante_id 
    FROM participantes_friend_family 
    LIMIT 1;
    
    -- Obtener una investigación
    SELECT id INTO investigacion_id 
    FROM investigaciones 
    LIMIT 1;
    
    -- Obtener un usuario
    SELECT id INTO usuario_id 
    FROM usuarios 
    LIMIT 1;
    
    -- Obtener un estado
    SELECT id INTO estado_id 
    FROM estado_agendamiento_cat 
    WHERE nombre ILIKE '%pendiente%'
    LIMIT 1;
    
    -- Mostrar los IDs obtenidos
    RAISE NOTICE 'Participante ID: %', participante_id;
    RAISE NOTICE 'Investigación ID: %', investigacion_id;
    RAISE NOTICE 'Usuario ID: %', usuario_id;
    RAISE NOTICE 'Estado ID: %', estado_id;
    
    -- Intentar insertar un reclutamiento
    IF participante_id IS NOT NULL AND investigacion_id IS NOT NULL AND usuario_id IS NOT NULL THEN
        INSERT INTO reclutamientos (
            investigacion_id,
            participantes_friend_family_id,
            tipo_participante,
            reclutador_id,
            creado_por,
            estado_agendamiento,
            fecha_asignado
        ) VALUES (
            investigacion_id,
            participante_id,
            'friend_family',
            usuario_id,
            usuario_id,
            estado_id,
            NOW()
        );
        RAISE NOTICE '✅ Inserción manual exitosa';
    ELSE
        RAISE NOTICE '❌ No se pudieron obtener los datos necesarios';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Error en inserción manual: %', SQLERRM;
END $$; 