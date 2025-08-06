-- ====================================
-- VERIFICAR Y CORREGIR TRIGGER DE ACTUALIZACIÓN
-- ====================================
-- Problema: Las estadísticas no se actualizan automáticamente
-- Objetivo: Verificar el trigger y corregir si es necesario

-- ====================================
-- 1. VERIFICAR TRIGGERS ACTIVOS
-- ====================================

SELECT '=== VERIFICANDO TRIGGERS ACTIVOS ===' as info;

-- Verificar todos los triggers en reclutamientos
SELECT 
    'Triggers activos en reclutamientos' as info,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'reclutamientos'
ORDER BY trigger_name;

-- ====================================
-- 2. VERIFICAR FUNCIONES RELACIONADAS
-- ====================================

SELECT '=== VERIFICANDO FUNCIONES RELACIONADAS ===' as info;

-- Verificar funciones existentes
SELECT 
    'Funciones relacionadas' as info,
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_name LIKE '%actualizar%'
OR routine_name LIKE '%estadisticas%'
OR routine_name LIKE '%vencidas%'
ORDER BY routine_name;

-- ====================================
-- 3. ELIMINAR TRIGGERS PROBLEMÁTICOS
-- ====================================

SELECT '=== ELIMINANDO TRIGGERS PROBLEMÁTICOS ===' as info;

-- Eliminar triggers que puedan estar causando conflictos
DROP TRIGGER IF EXISTS trigger_actualizar_estadisticas_simple ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_actualizar_vencidas_insert ON reclutamientos;

-- Eliminar funciones problemáticas
DROP FUNCTION IF EXISTS actualizar_estadisticas_on_finalizado() CASCADE;
DROP FUNCTION IF EXISTS trigger_actualizar_vencidas() CASCADE;

-- ====================================
-- 4. CREAR TRIGGER ROBUSTO Y SIMPLE
-- ====================================

SELECT '=== CREANDO TRIGGER ROBUSTO Y SIMPLE ===' as info;

-- Crear función simple y robusta
CREATE OR REPLACE FUNCTION trigger_estadisticas_finalizado()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo ejecutar cuando el estado cambia a 'Finalizado'
    IF NEW.estado_agendamiento = (
        SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
    ) 
    AND (OLD.estado_agendamiento IS NULL OR OLD.estado_agendamiento != (
        SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
    ))
    AND NEW.participantes_id IS NOT NULL THEN
        
        -- Log para debugging
        RAISE NOTICE 'Actualizando estadísticas para reclutamiento %', NEW.id;
        
        -- Actualizar estadísticas manualmente
        PERFORM actualizar_estadisticas_manual();
        
        RAISE NOTICE 'Estadísticas actualizadas para reclutamiento %', NEW.id;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger
CREATE TRIGGER trigger_estadisticas_finalizado
    AFTER UPDATE ON reclutamientos
    FOR EACH ROW
    EXECUTE FUNCTION trigger_estadisticas_finalizado();

-- ====================================
-- 5. CREAR TRIGGER PARA INSERT CON FECHA VENCIDA
-- ====================================

SELECT '=== CREANDO TRIGGER PARA INSERT CON FECHA VENCIDA ===' as info;

-- Crear función para manejar fechas vencidas en INSERT
CREATE OR REPLACE FUNCTION trigger_fecha_vencida_insert()
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
        
        RAISE NOTICE 'Participación con fecha vencida marcada como finalizada: %', NEW.id;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para INSERT
CREATE TRIGGER trigger_fecha_vencida_insert
    BEFORE INSERT ON reclutamientos
    FOR EACH ROW
    EXECUTE FUNCTION trigger_fecha_vencida_insert();

-- ====================================
-- 6. VERIFICAR CONFIGURACIÓN
-- ====================================

SELECT '=== VERIFICANDO CONFIGURACIÓN ===' as info;

-- Verificar triggers creados
SELECT 
    'Triggers creados' as info,
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers
WHERE event_object_table = 'reclutamientos'
ORDER BY trigger_name;

-- Verificar funciones creadas
SELECT 
    'Funciones creadas' as info,
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_name IN ('trigger_estadisticas_finalizado', 'trigger_fecha_vencida_insert')
ORDER BY routine_name;

-- ====================================
-- 7. PROBAR EL TRIGGER
-- ====================================

SELECT '=== PROBANDO EL TRIGGER ===' as info;

-- Verificar estado actual
SELECT 
    'Estado actual' as info,
    (SELECT COUNT(*) FROM historial_participacion_participantes) as historial_participantes,
    (SELECT COUNT(*) FROM historial_participacion_empresas) as historial_empresas;

-- ====================================
-- 8. INSTRUCCIONES DE PRUEBA
-- ====================================

SELECT '=== INSTRUCCIONES DE PRUEBA ===' as info;
SELECT '1. Ve a la aplicación y crea una nueva participación' as paso1;
SELECT '2. Cambia el estado a "Finalizado"' as paso2;
SELECT '3. Verifica en los logs si aparece el mensaje de actualización' as paso3;
SELECT '4. Verifica que las estadísticas se actualicen automáticamente' as paso4;
SELECT '5. Si no funciona, ejecuta manualmente: SELECT actualizar_estadisticas_manual();' as paso5;

-- ====================================
-- 9. COMANDOS DE DEBUGGING
-- ====================================

SELECT '=== COMANDOS DE DEBUGGING ===' as info;
SELECT 'Para ver logs: Revisa la consola de Supabase' as comando1;
SELECT 'Para actualizar manualmente: SELECT actualizar_estadisticas_manual();' as comando2;
SELECT 'Para ver estadísticas: SELECT * FROM vista_estadisticas_participantes;' as comando3;
SELECT 'Para ver estadísticas empresas: SELECT * FROM vista_estadisticas_empresas;' as comando4;
SELECT 'Para probar trigger: UPDATE reclutamientos SET estado_agendamiento = (SELECT id FROM estado_agendamiento_cat WHERE nombre = "Finalizado") WHERE id = "ID_DE_PRUEBA";' as comando5;

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== TRIGGER ROBUSTO CREADO ===' as info;
SELECT 'El trigger ahora incluye logging para debugging.' as mensaje;
SELECT 'Las estadísticas deberían actualizarse automáticamente.' as explicacion;
SELECT 'Si no funciona, revisa los logs en Supabase.' as instruccion_final; 