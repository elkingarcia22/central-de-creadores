-- ====================================
-- SOLUCIÓN AUTOMÁTICA PARA ENTORNO LOCAL
-- ====================================
-- Problema: Los triggers no funcionan automáticamente en local
-- Solución: Crear triggers específicos para entorno local
-- Objetivo: Automatización que funcione en desarrollo local

-- ====================================
-- 1. LIMPIAR TRIGGERS EXISTENTES
-- ====================================

SELECT '=== LIMPIANDO TRIGGERS EXISTENTES ===' as info;

-- Eliminar todos los triggers existentes
DROP TRIGGER IF EXISTS trigger_estadisticas_finalizado ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_fecha_vencida_insert ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_actualizar_estadisticas_simple ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_actualizar_vencidas_insert ON reclutamientos;

-- Eliminar funciones existentes
DROP FUNCTION IF EXISTS trigger_estadisticas_finalizado() CASCADE;
DROP FUNCTION IF EXISTS trigger_fecha_vencida_insert() CASCADE;
DROP FUNCTION IF EXISTS actualizar_estadisticas_on_finalizado() CASCADE;
DROP FUNCTION IF EXISTS trigger_actualizar_vencidas() CASCADE;

-- ====================================
-- 2. CREAR FUNCIÓN SIMPLE PARA LOCAL
-- ====================================

SELECT '=== CREANDO FUNCIÓN SIMPLE PARA LOCAL ===' as info;

CREATE OR REPLACE FUNCTION trigger_local_simple()
RETURNS TRIGGER AS $$
BEGIN
    -- Log para debugging en local
    RAISE LOG 'Trigger ejecutado: reclutamiento_id=%', NEW.id;
    RAISE LOG 'Estado anterior: %, Estado nuevo: %', OLD.estado_agendamiento, NEW.estado_agendamiento;
    
    -- Solo ejecutar cuando cambia a 'Finalizado'
    IF NEW.estado_agendamiento = (
        SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
    ) 
    AND (OLD.estado_agendamiento IS NULL OR OLD.estado_agendamiento != NEW.estado_agendamiento)
    AND NEW.participantes_id IS NOT NULL THEN
        
        RAISE LOG 'Actualizando estadísticas para reclutamiento %', NEW.id;
        
        -- Actualizar estadísticas inmediatamente
        DELETE FROM historial_participacion_participantes;
        DELETE FROM historial_participacion_empresas;
        
        -- Insertar participantes finalizados
        INSERT INTO historial_participacion_participantes (
            participante_id,
            investigacion_id,
            reclutamiento_id,
            empresa_id,
            fecha_participacion,
            estado_sesion,
            duracion_sesion,
            creado_por
        )
        SELECT 
            r.participantes_id,
            r.investigacion_id,
            r.id,
            COALESCE(p.empresa_id, (SELECT id FROM empresas LIMIT 1)),
            COALESCE(r.fecha_sesion, NOW()),
            'completada',
            COALESCE(r.duracion_sesion, 60),
            COALESCE(r.creado_por, auth.uid())
        FROM reclutamientos r
        LEFT JOIN participantes p ON r.participantes_id = p.id
        WHERE r.estado_agendamiento = (
            SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
        )
        AND r.participantes_id IS NOT NULL;
        
        -- Insertar empresas finalizadas
        INSERT INTO historial_participacion_empresas (
            empresa_id,
            investigacion_id,
            participante_id,
            reclutamiento_id,
            fecha_participacion,
            duracion_sesion,
            estado_sesion,
            rol_participante,
            tipo_investigacion,
            producto_evaluado,
            creado_por
        )
        SELECT 
            p.empresa_id,
            r.investigacion_id,
            r.participantes_id,
            r.id,
            COALESCE(r.fecha_sesion, NOW()),
            COALESCE(r.duracion_sesion, 60),
            'completada',
            COALESCE(re.nombre, 'Sin rol'),
            COALESCE(ti.nombre, 'Sin tipo'),
            COALESCE(pr.nombre, 'Sin producto'),
            COALESCE(r.creado_por, auth.uid())
        FROM reclutamientos r
        JOIN participantes p ON r.participantes_id = p.id
        LEFT JOIN roles_empresa re ON p.rol_empresa_id = re.id
        LEFT JOIN investigaciones i ON r.investigacion_id = i.id
        LEFT JOIN tipos_investigacion ti ON i.tipo_investigacion_id = ti.id
        LEFT JOIN productos pr ON i.producto_id = pr.id
        WHERE r.estado_agendamiento = (
            SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
        )
        AND r.participantes_id IS NOT NULL
        AND p.empresa_id IS NOT NULL;
        
        RAISE LOG 'Estadísticas actualizadas para reclutamiento %', NEW.id;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ====================================
-- 3. CREAR TRIGGER PARA LOCAL
-- ====================================

SELECT '=== CREANDO TRIGGER PARA LOCAL ===' as info;

-- Crear trigger AFTER UPDATE
CREATE TRIGGER trigger_local_simple_update
    AFTER UPDATE ON reclutamientos
    FOR EACH ROW
    EXECUTE FUNCTION trigger_local_simple();

-- Crear trigger AFTER INSERT para fechas vencidas
CREATE TRIGGER trigger_local_simple_insert
    AFTER INSERT ON reclutamientos
    FOR EACH ROW
    EXECUTE FUNCTION trigger_local_simple();

-- ====================================
-- 4. CREAR FUNCIÓN PARA FECHAS VENCIDAS
-- ====================================

SELECT '=== CREANDO FUNCIÓN PARA FECHAS VENCIDAS ===' as info;

CREATE OR REPLACE FUNCTION trigger_fecha_vencida_local()
RETURNS TRIGGER AS $$
BEGIN
    -- Si se inserta con fecha vencida, actualizar automáticamente
    IF NEW.fecha_sesion < NOW() 
    AND NEW.estado_agendamiento != (
        SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
    )
    AND NEW.participantes_id IS NOT NULL THEN
        
        RAISE LOG 'Participación con fecha vencida detectada: %', NEW.id;
        
        -- Actualizar a finalizado
        NEW.estado_agendamiento := (
            SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
        );
        
        RAISE LOG 'Participación marcada como finalizada: %', NEW.id;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger BEFORE INSERT
CREATE TRIGGER trigger_fecha_vencida_local_insert
    BEFORE INSERT ON reclutamientos
    FOR EACH ROW
    EXECUTE FUNCTION trigger_fecha_vencida_local();

-- ====================================
-- 5. VERIFICAR CONFIGURACIÓN
-- ====================================

SELECT '=== VERIFICANDO CONFIGURACIÓN ===' as info;

-- Verificar triggers creados
SELECT 
    'Triggers creados para local' as info,
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers
WHERE event_object_table = 'reclutamientos'
ORDER BY trigger_name;

-- Verificar funciones creadas
SELECT 
    'Funciones creadas para local' as info,
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_name IN ('trigger_local_simple', 'trigger_fecha_vencida_local')
ORDER BY routine_name;

-- ====================================
-- 6. PROBAR CONFIGURACIÓN
-- ====================================

SELECT '=== PROBANDO CONFIGURACIÓN ===' as info;

-- Verificar estado actual
SELECT 
    'Estado actual' as info,
    (SELECT COUNT(*) FROM historial_participacion_participantes) as historial_participantes,
    (SELECT COUNT(*) FROM historial_participacion_empresas) as historial_empresas;

-- ====================================
-- 7. INSTRUCCIONES PARA LOCAL
-- ====================================

SELECT '=== INSTRUCCIONES PARA LOCAL ===' as info;
SELECT '1. Ve a la aplicación y crea una nueva participación' as paso1;
SELECT '2. Cambia el estado a "Finalizado"' as paso2;
SELECT '3. Revisa los logs en la consola de tu aplicación' as paso3;
SELECT '4. Verifica que las estadísticas se actualicen automáticamente' as paso4;
SELECT '5. Si no funciona, revisa la configuración de PostgreSQL local' as paso5;

-- ====================================
-- 8. COMANDOS DE DEBUGGING PARA LOCAL
-- ====================================

SELECT '=== COMANDOS DE DEBUGGING PARA LOCAL ===' as info;
SELECT 'Para ver logs: Revisa la consola de tu aplicación' as comando1;
SELECT 'Para actualizar manualmente: SELECT actualizar_estadisticas_manual();' as comando2;
SELECT 'Para ver estadísticas: SELECT * FROM vista_estadisticas_participantes;' as comando3;
SELECT 'Para ver estadísticas empresas: SELECT * FROM vista_estadisticas_empresas;' as comando4;
SELECT 'Para probar trigger: UPDATE reclutamientos SET estado_agendamiento = (SELECT id FROM estado_agendamiento_cat WHERE nombre = "Finalizado") WHERE id = "ID_DE_PRUEBA";' as comando5;

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== SOLUCIÓN LOCAL IMPLEMENTADA ===' as info;
SELECT 'Triggers específicos para entorno local creados.' as mensaje;
SELECT 'Incluye logging detallado para debugging.' as explicacion;
SELECT 'Revisa los logs en la consola de tu aplicación.' as instruccion_final; 