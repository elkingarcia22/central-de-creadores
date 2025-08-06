-- =====================================================
-- PRUEBA COMPLETA DE FRIEND AND FAMILY
-- =====================================================

-- 1. VERIFICAR ESTRUCTURA DE TABLAS
SELECT 'ESTRUCTURA TABLAS' as fuente,
       table_name,
       column_name,
       data_type,
       is_nullable
FROM information_schema.columns 
WHERE table_name IN ('participantes_friend_family', 'historial_participacion_participantes_friend_family')
ORDER BY table_name, ordinal_position;

-- 2. VERIFICAR TRIGGERS ACTIVOS
SELECT 'TRIGGERS ACTIVOS' as fuente,
       trigger_name,
       event_manipulation,
       action_timing
FROM information_schema.triggers 
WHERE trigger_name LIKE '%friend_family%'
ORDER BY trigger_name;

-- 3. CREAR PARTICIPANTE FRIEND AND FAMILY DE PRUEBA
INSERT INTO participantes_friend_family (
    id,
    nombre,
    email,
    departamento_id
) VALUES (
    gen_random_uuid(),
    'Juan Pérez Friend',
    'juan.friend@example.com',
    (SELECT id FROM departamentos LIMIT 1)
) RETURNING id, nombre, email;

-- 4. OBTENER ID DEL PARTICIPANTE CREADO
DO $$
DECLARE
    participante_id UUID;
    investigacion_id UUID;
    usuario_id UUID;
BEGIN
    -- Obtener ID del participante creado
    SELECT id INTO participante_id FROM participantes_friend_family WHERE email = 'juan.friend@example.com';
    
    -- Obtener una investigación válida
    SELECT id INTO investigacion_id FROM investigaciones LIMIT 1;
    
    -- Obtener un usuario válido
    SELECT id INTO usuario_id FROM usuarios LIMIT 1;
    
    -- Crear reclutamiento de prueba
    INSERT INTO reclutamientos (
        id,
        investigacion_id,
        participantes_friend_family_id,
        tipo_participante,
        fecha_asignado,
        reclutador_id,
        creado_por,
        estado_agendamiento
    ) VALUES (
        gen_random_uuid(),
        investigacion_id,
        participante_id,
        'friend_family',
        NOW(),
        usuario_id,
        usuario_id,
        NULL
    );
    
    RAISE NOTICE 'Reclutamiento creado para participante Friend and Family: %', participante_id;
END $$;

-- 5. VERIFICAR QUE SE CREÓ EL HISTORIAL AUTOMÁTICAMENTE
SELECT 'HISTORIAL CREADO' as fuente,
       COUNT(*) as total_registros
FROM historial_participacion_participantes_friend_family;

-- 6. VER DETALLE DEL HISTORIAL
SELECT 'DETALLE HISTORIAL' as fuente,
       participante_friend_family_id,
       investigacion_id,
       reclutamiento_id,
       estado_sesion,
       created_at
FROM historial_participacion_participantes_friend_family
ORDER BY created_at DESC;

-- 7. SIMULAR API DE ESTADÍSTICAS
SELECT 'API FRIEND AND FAMILY' as fuente,
       COUNT(*) as total_participaciones
FROM historial_participacion_participantes_friend_family hff
WHERE hff.participante_friend_family_id = (
    SELECT id FROM participantes_friend_family WHERE email = 'juan.friend@example.com'
)
AND hff.estado_sesion = 'pendiente';

-- 8. VERIFICAR VISTA DE ESTADÍSTICAS
SELECT 'VISTA ESTADÍSTICAS' as fuente,
       participante_id,
       nombre,
       total_participaciones,
       ultima_participacion
FROM vista_estadisticas_participantes_friend_family
WHERE email = 'juan.friend@example.com';

-- 9. LIMPIAR DATOS DE PRUEBA (OPCIONAL)
-- DELETE FROM historial_participacion_participantes_friend_family WHERE participante_friend_family_id IN (
--     SELECT id FROM participantes_friend_family WHERE email = 'juan.friend@example.com'
-- );
-- DELETE FROM participantes_friend_family WHERE email = 'juan.friend@example.com'; 