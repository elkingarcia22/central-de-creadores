-- ====================================
-- TRIGGER SIMPLE PARA ACTUALIZACIÓN
-- ====================================
-- Problema: Las estadísticas no se actualizan automáticamente
-- Solución: Crear un trigger simple que actualice manualmente
-- Objetivo: Actualizar estadísticas cuando se cambia a "Finalizado"

-- ====================================
-- 1. CREAR FUNCIÓN SIMPLE
-- ====================================

SELECT '=== CREANDO FUNCIÓN SIMPLE ===' as info;

CREATE OR REPLACE FUNCTION actualizar_estadisticas_on_finalizado()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo ejecutar cuando el estado cambia a 'Finalizado'
    IF NEW.estado_agendamiento = (
        SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
    ) 
    AND OLD.estado_agendamiento != (
        SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
    )
    AND NEW.participantes_id IS NOT NULL THEN
        
        -- Actualizar estadísticas manualmente
        PERFORM actualizar_estadisticas_manual();
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ====================================
-- 2. CREAR TRIGGER
-- ====================================

SELECT '=== CREANDO TRIGGER ===' as info;

-- Crear trigger simple
CREATE TRIGGER trigger_actualizar_estadisticas_simple
    AFTER UPDATE ON reclutamientos
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_estadisticas_on_finalizado();

-- ====================================
-- 3. VERIFICAR CONFIGURACIÓN
-- ====================================

SELECT '=== VERIFICANDO CONFIGURACIÓN ===' as info;

-- Verificar trigger creado
SELECT 
    'Trigger creado' as info,
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers
WHERE trigger_name = 'trigger_actualizar_estadisticas_simple';

-- Verificar función creada
SELECT 
    'Función creada' as info,
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_name = 'actualizar_estadisticas_on_finalizado';

-- ====================================
-- 4. PROBAR EL TRIGGER
-- ====================================

SELECT '=== PROBANDO EL TRIGGER ===' as info;

-- Verificar estado actual
SELECT 
    'Estado actual' as info,
    (SELECT COUNT(*) FROM historial_participacion_participantes) as historial_participantes,
    (SELECT COUNT(*) FROM historial_participacion_empresas) as historial_empresas;

-- ====================================
-- 5. INSTRUCCIONES DE PRUEBA
-- ====================================

SELECT '=== INSTRUCCIONES DE PRUEBA ===' as info;
SELECT '1. Ve a la aplicación y crea una nueva participación' as paso1;
SELECT '2. Cambia el estado a "Finalizado"' as paso2;
SELECT '3. Espera unos segundos para que se procese' as paso3;
SELECT '4. Verifica que las estadísticas se actualicen automáticamente' as paso4;
SELECT '5. Si no funciona, ejecuta manualmente: SELECT actualizar_estadisticas_manual();' as paso5;

-- ====================================
-- 6. COMANDOS ÚTILES
-- ====================================

SELECT '=== COMANDOS ÚTILES ===' as info;
SELECT 'Para actualizar manualmente: SELECT actualizar_estadisticas_manual();' as comando1;
SELECT 'Para ver estadísticas participantes: SELECT * FROM vista_estadisticas_participantes;' as comando2;
SELECT 'Para ver estadísticas empresas: SELECT * FROM vista_estadisticas_empresas;' as comando3;
SELECT 'Para ver historial participantes: SELECT * FROM historial_participacion_participantes;' as comando4;
SELECT 'Para ver historial empresas: SELECT * FROM historial_participacion_empresas;' as comando5;

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== TRIGGER SIMPLE CREADO ===' as info;
SELECT 'Ahora las estadísticas se actualizarán automáticamente cuando finalices una participación.' as mensaje;
SELECT 'El trigger es simple y confiable, sin conflictos.' as explicacion;
SELECT 'Si no funciona automáticamente, usa: SELECT actualizar_estadisticas_manual();' as instruccion_final; 