-- =====================================================
-- DESHABILITAR TRIGGER TEMPORALMENTE PARA PRUEBAS
-- =====================================================

-- 1. DESHABILITAR EL TRIGGER
DROP TRIGGER IF EXISTS trigger_participantes_friend_family_trigger ON reclutamientos;

-- 2. VERIFICAR QUE SE DESHABILITÓ
SELECT 
    'TRIGGERS ACTIVOS' as tipo,
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE table_name = 'reclutamientos';

-- 3. PROBAR INSERCIÓN SIN TRIGGER
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
    
    RAISE NOTICE 'Probando inserción sin trigger...';
    
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
    
    RAISE NOTICE '✅ Reclutamiento creado sin trigger: %', reclutamiento_id;
    
    -- Limpiar el reclutamiento de prueba
    DELETE FROM reclutamientos WHERE id = reclutamiento_id;
    RAISE NOTICE '✅ Reclutamiento de prueba eliminado';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Error sin trigger: %', SQLERRM;
END $$;

-- 4. REHABILITAR EL TRIGGER
CREATE TRIGGER trigger_participantes_friend_family_trigger
    AFTER INSERT OR UPDATE ON reclutamientos
    FOR EACH ROW
    EXECUTE FUNCTION trigger_participantes_friend_family();

-- 5. VERIFICAR QUE SE REHABILITÓ
SELECT 
    'TRIGGER REHABILITADO' as tipo,
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_participantes_friend_family_trigger'; 