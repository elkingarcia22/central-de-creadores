-- ====================================
-- SOLUCIÓN PARA FECHA VENCIDA
-- ====================================
-- Problema: Participaciones con fecha vencida quedan en "Pendiente"
-- Solución: Actualizar automáticamente a "Finalizado" y actualizar estadísticas
-- Objetivo: Manejar el caso de fechas vencidas

-- ====================================
-- 1. VERIFICAR PARTICIPACIONES CON FECHA VENCIDA
-- ====================================

SELECT '=== VERIFICANDO PARTICIPACIONES CON FECHA VENCIDA ===' as info;

-- Verificar participaciones con fecha vencida que están pendientes
SELECT 
    'Participaciones con fecha vencida pendientes' as info,
    COUNT(*) as total_vencidas_pendientes
FROM reclutamientos r
WHERE r.fecha_sesion < NOW()
AND r.estado_agendamiento != (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
)
AND r.participantes_id IS NOT NULL;

-- Mostrar detalles de participaciones vencidas
SELECT 
    'Detalles participaciones vencidas' as info,
    r.id as reclutamiento_id,
    r.participantes_id,
    p.nombre as participante,
    r.fecha_sesion,
    eac.nombre as estado_actual,
    CASE WHEN r.fecha_sesion < NOW() THEN 'VENCIDA' ELSE 'VIGENTE' END as estado_fecha
FROM reclutamientos r
JOIN participantes p ON r.participantes_id = p.id
JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
WHERE r.fecha_sesion < NOW()
AND r.estado_agendamiento != (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
)
AND r.participantes_id IS NOT NULL
ORDER BY r.fecha_sesion;

-- ====================================
-- 2. ACTUALIZAR PARTICIPACIONES VENCIDAS A FINALIZADO
-- ====================================

SELECT '=== ACTUALIZANDO PARTICIPACIONES VENCIDAS ===' as info;

-- Actualizar participaciones vencidas a finalizado
UPDATE reclutamientos 
SET estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
)
WHERE fecha_sesion < NOW()
AND estado_agendamiento != (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
)
AND participantes_id IS NOT NULL;

-- ====================================
-- 3. VERIFICAR ACTUALIZACIÓN
-- ====================================

SELECT '=== VERIFICANDO ACTUALIZACIÓN ===' as info;

-- Verificar cuántas se actualizaron
SELECT 
    'Participaciones actualizadas a finalizado' as info,
    COUNT(*) as total_actualizadas
FROM reclutamientos r
WHERE r.fecha_sesion < NOW()
AND r.estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
)
AND r.participantes_id IS NOT NULL;

-- ====================================
-- 4. ACTUALIZAR ESTADÍSTICAS
-- ====================================

SELECT '=== ACTUALIZANDO ESTADÍSTICAS ===' as info;

-- Actualizar estadísticas manualmente
SELECT actualizar_estadisticas_manual();

-- ====================================
-- 5. VERIFICAR ESTADÍSTICAS ACTUALIZADAS
-- ====================================

SELECT '=== VERIFICANDO ESTADÍSTICAS ACTUALIZADAS ===' as info;

-- Verificar estadísticas actuales
SELECT 
    'Estadísticas actuales' as info,
    (SELECT COUNT(*) FROM historial_participacion_participantes) as historial_participantes,
    (SELECT COUNT(*) FROM historial_participacion_empresas) as historial_empresas;

-- Verificar reclutamientos finalizados
SELECT 
    'Reclutamientos finalizados' as info,
    COUNT(*) as total_finalizados
FROM reclutamientos 
WHERE participantes_id IS NOT NULL
AND estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
);

-- ====================================
-- 6. CREAR FUNCIÓN PARA ACTUALIZAR VENCIDAS AUTOMÁTICAMENTE
-- ====================================

SELECT '=== CREANDO FUNCIÓN PARA ACTUALIZAR VENCIDAS ===' as info;

CREATE OR REPLACE FUNCTION actualizar_vencidas_automatico()
RETURNS void AS $$
BEGIN
    -- Actualizar participaciones vencidas a finalizado
    UPDATE reclutamientos 
    SET estado_agendamiento = (
        SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
    )
    WHERE fecha_sesion < NOW()
    AND estado_agendamiento != (
        SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
    )
    AND participantes_id IS NOT NULL;
    
    -- Actualizar estadísticas
    PERFORM actualizar_estadisticas_manual();
END;
$$ LANGUAGE plpgsql;

-- ====================================
-- 7. CREAR TRIGGER PARA ACTUALIZAR VENCIDAS
-- ====================================

SELECT '=== CREANDO TRIGGER PARA VENCIDAS ===' as info;

-- Crear función trigger para actualizar vencidas
CREATE OR REPLACE FUNCTION trigger_actualizar_vencidas()
RETURNS TRIGGER AS $$
BEGIN
    -- Si se inserta una participación con fecha vencida, actualizarla automáticamente
    IF NEW.fecha_sesion < NOW() 
    AND NEW.estado_agendamiento != (
        SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
    )
    AND NEW.participantes_id IS NOT NULL THEN
        
        -- Actualizar a finalizado
        NEW.estado_agendamiento := (
            SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
        );
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para INSERT
CREATE TRIGGER trigger_actualizar_vencidas_insert
    BEFORE INSERT ON reclutamientos
    FOR EACH ROW
    EXECUTE FUNCTION trigger_actualizar_vencidas();

-- ====================================
-- 8. INSTRUCCIONES DE USO
-- ====================================

SELECT '=== INSTRUCCIONES DE USO ===' as info;
SELECT '1. Las participaciones con fecha vencida se actualizan automáticamente' as paso1;
SELECT '2. Para actualizar manualmente: SELECT actualizar_vencidas_automatico();' as paso2;
SELECT '3. Para actualizar estadísticas: SELECT actualizar_estadisticas_manual();' as paso3;
SELECT '4. Las nuevas participaciones con fecha vencida se marcan como finalizadas' as paso4;

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== SOLUCIÓN PARA FECHA VENCIDA IMPLEMENTADA ===' as info;
SELECT 'Las participaciones vencidas se actualizan automáticamente a finalizado.' as mensaje;
SELECT 'Las estadísticas se actualizan cuando hay cambios.' as explicacion;
SELECT 'Para actualizar manualmente: SELECT actualizar_vencidas_automatico();' as instruccion_final; 