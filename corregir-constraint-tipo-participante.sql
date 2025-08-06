-- =====================================================
-- CORREGIR CONSTRAINT TIPO_PARTICIPANTE
-- =====================================================

-- 1. VERIFICAR LA CONSTRAINT ACTUAL
SELECT 
    'CONSTRAINT ACTUAL' as tipo,
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'reclutamientos'::regclass 
AND contype = 'c'
AND conname LIKE '%tipo_participante%';

-- 2. VERIFICAR VALORES PERMITIDOS ACTUALMENTE
SELECT 
    'VALORES ACTUALES' as tipo,
    tipo_participante,
    COUNT(*) as total
FROM reclutamientos 
WHERE tipo_participante IS NOT NULL
GROUP BY tipo_participante
ORDER BY tipo_participante;

-- 3. ELIMINAR LA CONSTRAINT ACTUAL
ALTER TABLE reclutamientos 
DROP CONSTRAINT IF EXISTS reclutamientos_tipo_participante_check;

-- 4. CREAR NUEVA CONSTRAINT CON FRIEND_FAMILY
ALTER TABLE reclutamientos 
ADD CONSTRAINT reclutamientos_tipo_participante_check 
CHECK (tipo_participante IN ('externo', 'interno', 'friend_family'));

-- 5. VERIFICAR QUE SE CREÓ CORRECTAMENTE
SELECT 
    'CONSTRAINT NUEVA' as tipo,
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'reclutamientos'::regclass 
AND contype = 'c'
AND conname LIKE '%tipo_participante%';

-- 6. PROBAR INSERCIÓN CON LA NUEVA CONSTRAINT
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
    
    RAISE NOTICE 'Probando inserción con constraint corregida...';
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
    
    -- Limpiar el reclutamiento de prueba
    DELETE FROM reclutamientos WHERE id = reclutamiento_id;
    DELETE FROM historial_participacion_participantes_friend_family WHERE reclutamiento_id = reclutamiento_id;
    RAISE NOTICE '✅ Datos de prueba eliminados';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Error con constraint corregida: %', SQLERRM;
END $$;

-- 7. VERIFICAR VALORES FINALES
SELECT 
    'VALORES FINALES' as tipo,
    tipo_participante,
    COUNT(*) as total
FROM reclutamientos 
WHERE tipo_participante IS NOT NULL
GROUP BY tipo_participante
ORDER BY tipo_participante; 