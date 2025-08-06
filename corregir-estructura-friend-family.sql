-- =====================================================
-- CORREGIR ESTRUCTURA FRIEND AND FAMILY
-- =====================================================

-- 1. VERIFICAR ESTRUCTURA ACTUAL DE LA TABLA
SELECT 
    'ESTRUCTURA ACTUAL' as tipo,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'participantes_friend_family'
ORDER BY ordinal_position;

-- 2. AGREGAR COLUMNA ROL_EMPRESA_ID SI NO EXISTE
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'participantes_friend_family' 
        AND column_name = 'rol_empresa_id'
    ) THEN
        ALTER TABLE participantes_friend_family 
        ADD COLUMN rol_empresa_id UUID REFERENCES roles_empresa(id);
        RAISE NOTICE '✅ Columna rol_empresa_id agregada';
    ELSE
        RAISE NOTICE 'ℹ️ Columna rol_empresa_id ya existe';
    END IF;
END $$;

-- 3. CORREGIR LA FUNCIÓN DEL TRIGGER
CREATE OR REPLACE FUNCTION trigger_participantes_friend_family()
RETURNS TRIGGER AS $func$
BEGIN
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        IF NEW.participantes_friend_family_id IS NOT NULL THEN
            IF NOT EXISTS (
                SELECT 1 FROM historial_participacion_participantes_friend_family
                WHERE participante_friend_family_id = NEW.participantes_friend_family_id
                AND investigacion_id = NEW.investigacion_id
                AND reclutamiento_id = NEW.id
            ) THEN
                INSERT INTO historial_participacion_participantes_friend_family (
                    participante_friend_family_id,
                    investigacion_id,
                    reclutamiento_id,
                    estado_sesion,
                    created_at,
                    updated_at
                ) VALUES (
                    NEW.participantes_friend_family_id,
                    NEW.investigacion_id,
                    NEW.id,
                    CASE
                        WHEN NEW.estado_agendamiento IS NOT NULL THEN 'completada'
                        ELSE 'pendiente'
                    END,
                    NOW(),
                    NOW()
                );
                RAISE LOG '✅ Trigger friend family: Registro insertado en historial';
            END IF;
        END IF;
    END IF;
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG '❌ Error en trigger_participantes_friend_family: %', SQLERRM;
        RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

-- 4. RECREAR EL TRIGGER
DROP TRIGGER IF EXISTS trigger_participantes_friend_family_trigger ON reclutamientos;
CREATE TRIGGER trigger_participantes_friend_family_trigger
    AFTER INSERT OR UPDATE ON reclutamientos
    FOR EACH ROW
    EXECUTE FUNCTION trigger_participantes_friend_family();

-- 5. VERIFICAR QUE TODO ESTÉ CORRECTO
SELECT 
    'TRIGGER CORREGIDO' as tipo,
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_participantes_friend_family_trigger';

-- 6. VERIFICAR ESTRUCTURA FINAL
SELECT 
    'ESTRUCTURA FINAL' as tipo,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'participantes_friend_family'
ORDER BY ordinal_position;

-- 7. PROBAR INSERCIÓN CON TRIGGER CORREGIDO
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
    
    RAISE NOTICE 'Probando inserción con trigger corregido...';
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
    
    RAISE NOTICE '✅ Reclutamiento creado con trigger: %', reclutamiento_id;
    
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
        RAISE NOTICE '❌ Error con trigger corregido: %', SQLERRM;
END $$; 