-- =====================================================
-- PROBAR INSERCIÓN DIRECTA EN SUPABASE
-- =====================================================

-- 1. OBTENER DATOS DE PRUEBA
SELECT 
    'DATOS DE PRUEBA' as tipo,
    'Participantes Friend and Family' as tabla,
    COUNT(*) as total
FROM participantes_friend_family;

SELECT 
    'DATOS DE PRUEBA' as tipo,
    'Investigaciones' as tabla,
    COUNT(*) as total
FROM investigaciones;

SELECT 
    'DATOS DE PRUEBA' as tipo,
    'Usuarios' as tabla,
    COUNT(*) as total
FROM usuarios;

SELECT 
    'DATOS DE PRUEBA' as tipo,
    'Estados Agendamiento' as tabla,
    id,
    nombre
FROM estado_agendamiento_cat
ORDER BY nombre;

-- 2. PROBAR INSERCIÓN DIRECTA
DO $$
DECLARE
    participante_id UUID;
    investigacion_id UUID;
    usuario_id UUID;
    estado_id UUID;
    reclutamiento_id UUID;
    resultado JSON;
BEGIN
    -- Obtener datos de prueba
    SELECT id INTO participante_id FROM participantes_friend_family LIMIT 1;
    SELECT id INTO investigacion_id FROM investigaciones LIMIT 1;
    SELECT id INTO usuario_id FROM usuarios LIMIT 1;
    SELECT id INTO estado_id FROM estado_agendamiento_cat WHERE nombre ILIKE '%pendiente%' LIMIT 1;
    
    RAISE NOTICE '=== DATOS OBTENIDOS ===';
    RAISE NOTICE 'Participante: %', participante_id;
    RAISE NOTICE 'Investigación: %', investigacion_id;
    RAISE NOTICE 'Usuario: %', usuario_id;
    RAISE NOTICE 'Estado: %', estado_id;
    
    -- Verificar que todos los datos existen
    IF participante_id IS NULL THEN
        RAISE EXCEPTION 'No se encontró participante Friend and Family';
    END IF;
    
    IF investigacion_id IS NULL THEN
        RAISE EXCEPTION 'No se encontró investigación';
    END IF;
    
    IF usuario_id IS NULL THEN
        RAISE EXCEPTION 'No se encontró usuario';
    END IF;
    
    IF estado_id IS NULL THEN
        RAISE EXCEPTION 'No se encontró estado de agendamiento';
    END IF;
    
    RAISE NOTICE '=== INICIANDO INSERCIÓN ===';
    
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
    
    RAISE NOTICE '✅ Reclutamiento creado exitosamente: %', reclutamiento_id;
    
    -- Verificar que se creó el registro en historial
    IF EXISTS (
        SELECT 1 FROM historial_participacion_participantes_friend_family 
        WHERE reclutamiento_id = reclutamiento_id
    ) THEN
        RAISE NOTICE '✅ Registro en historial creado correctamente';
    ELSE
        RAISE NOTICE '❌ No se creó registro en historial';
    END IF;
    
    -- Mostrar el reclutamiento creado
    SELECT row_to_json(r) INTO resultado
    FROM reclutamientos r
    WHERE r.id = reclutamiento_id;
    
    RAISE NOTICE '=== RECLUTAMIENTO CREADO ===';
    RAISE NOTICE '%', resultado;
    
    -- Limpiar el reclutamiento de prueba
    DELETE FROM reclutamientos WHERE id = reclutamiento_id;
    DELETE FROM historial_participacion_participantes_friend_family WHERE reclutamiento_id = reclutamiento_id;
    RAISE NOTICE '✅ Datos de prueba eliminados';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Error en inserción directa: %', SQLERRM;
        RAISE NOTICE '❌ Código de error: %', SQLSTATE;
END $$;

-- 3. VERIFICAR ESTRUCTURA DE LA TABLA RECLUTAMIENTOS
SELECT 
    'ESTRUCTURA RECLUTAMIENTOS' as tipo,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'reclutamientos' 
AND column_name IN (
    'participantes_friend_family_id', 
    'tipo_participante', 
    'estado_agendamiento',
    'investigacion_id',
    'reclutador_id',
    'creado_por',
    'fecha_asignado'
)
ORDER BY ordinal_position; 