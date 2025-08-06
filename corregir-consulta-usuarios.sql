-- =====================================================
-- CORREGIR CONSULTA DE USUARIOS
-- =====================================================

-- 1. VERIFICAR ESTRUCTURA REAL DE LA TABLA USUARIOS
SELECT 
    'ESTRUCTURA USUARIOS' as tipo,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'usuarios'
ORDER BY ordinal_position;

-- 2. PROBAR CONSULTA CORREGIDA DE USUARIOS
SELECT 
    'USUARIOS DISPONIBLES' as tipo,
    id,
    -- Intentar diferentes nombres de columna
    COALESCE(
        (SELECT column_name FROM information_schema.columns 
         WHERE table_name = 'usuarios' AND column_name = 'full_name' LIMIT 1),
        (SELECT column_name FROM information_schema.columns 
         WHERE table_name = 'usuarios' AND column_name = 'nombre' LIMIT 1),
        (SELECT column_name FROM information_schema.columns 
         WHERE table_name = 'usuarios' AND column_name = 'name' LIMIT 1),
        'id'
    ) as nombre_columna
FROM usuarios
LIMIT 3;

-- 3. PROBAR INSERCIÓN CON DATOS REALES
DO $$
DECLARE
    participante_id UUID;
    investigacion_id UUID;
    usuario_id UUID;
    estado_id UUID;
    reclutamiento_id UUID;
BEGIN
    -- Obtener datos de prueba
    SELECT id INTO participante_id FROM participantes_friend_family LIMIT 1;
    SELECT id INTO investigacion_id FROM investigaciones LIMIT 1;
    SELECT id INTO usuario_id FROM usuarios LIMIT 1;
    SELECT id INTO estado_id FROM estado_agendamiento_cat WHERE nombre ILIKE '%pendiente%' LIMIT 1;
    
    RAISE NOTICE 'Probando inserción con datos reales...';
    RAISE NOTICE 'Participante: %, Investigación: %, Usuario: %', participante_id, investigacion_id, usuario_id;
    
    -- Insertar reclutamiento
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
    ) RETURNING id INTO reclutamiento_id;
    
    RAISE NOTICE '✅ Reclutamiento creado: %', reclutamiento_id;
    
    -- Verificar que se creó el registro en historial
    IF EXISTS (
        SELECT 1 FROM historial_participacion_participantes_friend_family 
        WHERE reclutamiento_id = reclutamiento_id
    ) THEN
        RAISE NOTICE '✅ Registro en historial creado correctamente';
    ELSE
        RAISE NOTICE '❌ No se creó registro en historial';
    END IF;
    
    -- Limpiar el reclutamiento de prueba
    DELETE FROM reclutamientos WHERE id = reclutamiento_id;
    DELETE FROM historial_participacion_participantes_friend_family WHERE reclutamiento_id = reclutamiento_id;
    RAISE NOTICE '✅ Datos de prueba eliminados';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Error en inserción: %', SQLERRM;
END $$;

-- 4. VERIFICAR TRIGGER ACTIVO
SELECT 
    'TRIGGER FINAL' as tipo,
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_participantes_friend_family_trigger'; 