-- ====================================
-- PROBAR TRIGGERS AUTOMÁTICOS
-- ====================================
-- Objetivo: Verificar que los triggers funcionan correctamente
-- Método: Simular la finalización de un reclutamiento y verificar que se inserta en historial

-- ====================================
-- 1. VERIFICAR ESTADO INICIAL
-- ====================================

SELECT '=== VERIFICANDO ESTADO INICIAL ===' as info;

-- Verificar estadísticas actuales
SELECT 
    'Estadísticas actuales' as info,
    (SELECT COUNT(*) FROM historial_participacion_participantes) as historial_participantes,
    (SELECT COUNT(*) FROM historial_participacion_empresas) as historial_empresas;

-- Verificar reclutamientos no finalizados disponibles para prueba
SELECT 
    'Reclutamientos no finalizados disponibles' as info,
    COUNT(*) as total_no_finalizados
FROM reclutamientos 
WHERE participantes_id IS NOT NULL
AND estado_agendamiento != (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
);

-- Mostrar detalles de reclutamientos no finalizados
SELECT 
    'Detalles de reclutamientos no finalizados' as info,
    r.id as reclutamiento_id,
    r.participantes_id,
    p.nombre as participante,
    e.nombre as empresa,
    eac.nombre as estado_actual
FROM reclutamientos r
JOIN participantes p ON r.participantes_id = p.id
LEFT JOIN empresas e ON p.empresa_id = e.id
JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
WHERE r.participantes_id IS NOT NULL
AND r.estado_agendamiento != (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
)
ORDER BY p.nombre, r.id
LIMIT 5;

-- ====================================
-- 2. SELECCIONAR RECLUTAMIENTO PARA PRUEBA
-- ====================================

SELECT '=== SELECCIONANDO RECLUTAMIENTO PARA PRUEBA ===' as info;

-- Seleccionar el primer reclutamiento no finalizado para la prueba
DO $$
DECLARE
    reclutamiento_test_id UUID;
    participante_test_id UUID;
    empresa_test_id UUID;
    estado_finalizado_id UUID;
BEGIN
    -- Obtener ID del estado finalizado
    SELECT id INTO estado_finalizado_id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado';
    
    -- Seleccionar un reclutamiento no finalizado
    SELECT r.id, r.participantes_id, p.empresa_id 
    INTO reclutamiento_test_id, participante_test_id, empresa_test_id
    FROM reclutamientos r
    JOIN participantes p ON r.participantes_id = p.id
    WHERE r.participantes_id IS NOT NULL
    AND r.estado_agendamiento != estado_finalizado_id
    LIMIT 1;
    
    -- Mostrar información del reclutamiento seleccionado
    RAISE NOTICE 'Reclutamiento seleccionado para prueba: %', reclutamiento_test_id;
    RAISE NOTICE 'Participante: %', participante_test_id;
    RAISE NOTICE 'Empresa: %', empresa_test_id;
    
    -- Verificar que no está ya en el historial
    IF NOT EXISTS (
        SELECT 1 FROM historial_participacion_participantes 
        WHERE reclutamiento_id = reclutamiento_test_id
    ) THEN
        RAISE NOTICE 'El reclutamiento NO está en historial de participantes';
    ELSE
        RAISE NOTICE 'El reclutamiento YA está en historial de participantes';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM historial_participacion_empresas 
        WHERE reclutamiento_id = reclutamiento_test_id
    ) THEN
        RAISE NOTICE 'El reclutamiento NO está en historial de empresas';
    ELSE
        RAISE NOTICE 'El reclutamiento YA está en historial de empresas';
    END IF;
    
    -- Guardar el ID para uso posterior
    PERFORM set_config('app.reclutamiento_test_id', reclutamiento_test_id::text, false);
END $$;

-- ====================================
-- 3. SIMULAR FINALIZACIÓN (ACTIVAR TRIGGERS)
-- ====================================

SELECT '=== SIMULANDO FINALIZACIÓN ===' as info;

-- Simular la finalización de un reclutamiento (esto activará los triggers)
UPDATE reclutamientos 
SET 
    estado_agendamiento = (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'),
    fecha_sesion = NOW(),
    duracion_sesion = 60
WHERE id = (
    SELECT r.id
    FROM reclutamientos r
    WHERE r.participantes_id IS NOT NULL
    AND r.estado_agendamiento != (
        SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
    )
    LIMIT 1
);

-- ====================================
-- 4. VERIFICAR RESULTADO INMEDIATO
-- ====================================

SELECT '=== VERIFICANDO RESULTADO INMEDIATO ===' as info;

-- Verificar estadísticas después de la prueba
SELECT 
    'Estadísticas después de la prueba' as info,
    (SELECT COUNT(*) FROM historial_participacion_participantes) as historial_participantes,
    (SELECT COUNT(*) FROM historial_participacion_empresas) as historial_empresas;

-- Verificar que se insertó en historial de participantes
SELECT 
    'Verificación de inserción en participantes' as info,
    COUNT(*) as registros_insertados
FROM historial_participacion_participantes h
JOIN reclutamientos r ON h.reclutamiento_id = r.id
WHERE r.estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
)
AND r.fecha_sesion >= NOW() - INTERVAL '5 minutes';

-- Verificar que se insertó en historial de empresas
SELECT 
    'Verificación de inserción en empresas' as info,
    COUNT(*) as registros_insertados
FROM historial_participacion_empresas h
JOIN reclutamientos r ON h.reclutamiento_id = r.id
WHERE r.estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
)
AND r.fecha_sesion >= NOW() - INTERVAL '5 minutes';

-- ====================================
-- 5. VERIFICAR DETALLES DE LA INSERCIÓN
-- ====================================

SELECT '=== VERIFICANDO DETALLES DE LA INSERCIÓN ===' as info;

-- Mostrar los registros más recientes en historial de participantes
SELECT 
    'Registros recientes en historial participantes' as info,
    h.id as historial_id,
    h.participante_id,
    h.reclutamiento_id,
    p.nombre as participante,
    h.estado_sesion,
    h.fecha_participacion
FROM historial_participacion_participantes h
JOIN participantes p ON h.participante_id = p.id
ORDER BY h.fecha_participacion DESC
LIMIT 3;

-- Mostrar los registros más recientes en historial de empresas
SELECT 
    'Registros recientes en historial empresas' as info,
    h.id as historial_id,
    h.empresa_id,
    h.reclutamiento_id,
    e.nombre as empresa,
    h.estado_sesion,
    h.fecha_participacion
FROM historial_participacion_empresas h
JOIN empresas e ON h.empresa_id = e.id
ORDER BY h.fecha_participacion DESC
LIMIT 3;

-- ====================================
-- 6. VERIFICAR QUE NO HAY DUPLICADOS
-- ====================================

SELECT '=== VERIFICANDO QUE NO HAY DUPLICADOS ===' as info;

-- Verificar duplicados en historial de participantes
SELECT 
    'Duplicados en historial participantes' as info,
    COUNT(*) as duplicados
FROM (
    SELECT reclutamiento_id, COUNT(*) as cnt
    FROM historial_participacion_participantes
    GROUP BY reclutamiento_id
    HAVING COUNT(*) > 1
) as dups;

-- Verificar duplicados en historial de empresas
SELECT 
    'Duplicados en historial empresas' as info,
    COUNT(*) as duplicados
FROM (
    SELECT reclutamiento_id, COUNT(*) as cnt
    FROM historial_participacion_empresas
    GROUP BY reclutamiento_id
    HAVING COUNT(*) > 1
) as dups;

-- ====================================
-- 7. VERIFICAR CORRESPONDENCIA EXACTA
-- ====================================

SELECT '=== VERIFICANDO CORRESPONDENCIA EXACTA ===' as info;

-- Verificar que el número de reclutamientos finalizados coincide con el historial
SELECT 
    'Correspondencia finalizados vs historial' as info,
    (SELECT COUNT(*) FROM reclutamientos WHERE participantes_id IS NOT NULL AND estado_agendamiento = (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado')) as reclutamientos_finalizados,
    (SELECT COUNT(*) FROM historial_participacion_participantes) as en_historial_participantes,
    (SELECT COUNT(*) FROM historial_participacion_empresas) as en_historial_empresas;

-- ====================================
-- 8. INSTRUCCIONES PARA PRUEBA MANUAL
-- ====================================

SELECT '=== INSTRUCCIONES PARA PRUEBA MANUAL ===' as info;
SELECT '1. Ve a la aplicación y crea una nueva participación' as paso1;
SELECT '2. Cambia el estado de la participación a "Finalizado"' as paso2;
SELECT '3. Verifica que las estadísticas se actualicen automáticamente' as paso3;
SELECT '4. Si funciona, los triggers están funcionando correctamente' as paso4;
SELECT '5. Si no funciona, ejecuta el script de diagnóstico' as paso5;

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== PRUEBA DE TRIGGERS COMPLETADA ===' as info;
SELECT 'Los triggers han sido probados automáticamente.' as mensaje;
SELECT 'Ahora prueba manualmente creando y finalizando una participación.' as instruccion;
SELECT 'Si las estadísticas se actualizan automáticamente, todo funciona correctamente.' as siguiente_paso; 