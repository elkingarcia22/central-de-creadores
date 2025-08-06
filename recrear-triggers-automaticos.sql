-- ====================================
-- RECREAR TRIGGERS AUTOMÁTICOS
-- ====================================
-- Problema: Los triggers fueron eliminados y no se suman nuevas participaciones
-- Solución: Recrear triggers que funcionen correctamente
-- Objetivo: Automatizar la inserción en historial cuando se finalice una participación

-- ====================================
-- 1. CREAR FUNCIÓN PARA PARTICIPANTES
-- ====================================

SELECT '=== CREANDO FUNCIÓN PARA PARTICIPANTES ===' as info;

CREATE OR REPLACE FUNCTION sincronizar_historial_participantes_automatico()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo insertar si el reclutamiento está finalizado
    IF NEW.estado_agendamiento = (
        SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
    ) AND NEW.participantes_id IS NOT NULL THEN
        
        -- Verificar que no existe ya en el historial
        IF NOT EXISTS (
            SELECT 1 FROM historial_participacion_participantes 
            WHERE reclutamiento_id = NEW.id
        ) THEN
            -- Insertar en historial de participantes
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
                NEW.participantes_id,
                NEW.investigacion_id,
                NEW.id,
                COALESCE(p.empresa_id, (SELECT id FROM empresas LIMIT 1)),
                COALESCE(NEW.fecha_sesion, NOW()),
                'completada',
                COALESCE(NEW.duracion_sesion, 60),
                COALESCE(NEW.creado_por, auth.uid())
            FROM participantes p
            WHERE p.id = NEW.participantes_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ====================================
-- 2. CREAR FUNCIÓN PARA EMPRESAS
-- ====================================

SELECT '=== CREANDO FUNCIÓN PARA EMPRESAS ===' as info;

CREATE OR REPLACE FUNCTION insertar_historial_empresa_automatico()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo insertar si el reclutamiento está finalizado y tiene empresa
    IF NEW.estado_agendamiento = (
        SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
    ) AND NEW.participantes_id IS NOT NULL THEN
        
        -- Obtener empresa del participante
        DECLARE
            empresa_id_participante UUID;
        BEGIN
            SELECT empresa_id INTO empresa_id_participante
            FROM participantes
            WHERE id = NEW.participantes_id;
            
            -- Solo insertar si el participante tiene empresa
            IF empresa_id_participante IS NOT NULL THEN
                -- Verificar que no existe ya en el historial
                IF NOT EXISTS (
                    SELECT 1 FROM historial_participacion_empresas 
                    WHERE reclutamiento_id = NEW.id
                ) THEN
                    -- Insertar en historial de empresas
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
                        empresa_id_participante,
                        NEW.investigacion_id,
                        NEW.participantes_id,
                        NEW.id,
                        COALESCE(NEW.fecha_sesion, NOW()),
                        COALESCE(NEW.duracion_sesion, 60),
                        'completada',
                        COALESCE(re.nombre, 'Sin rol'),
                        COALESCE(ti.nombre, 'Sin tipo'),
                        COALESCE(pr.nombre, 'Sin producto'),
                        COALESCE(NEW.creado_por, auth.uid())
                    FROM participantes p
                    LEFT JOIN roles_empresa re ON p.rol_empresa_id = re.id
                    LEFT JOIN investigaciones i ON NEW.investigacion_id = i.id
                    LEFT JOIN tipos_investigacion ti ON i.tipo_investigacion_id = ti.id
                    LEFT JOIN productos pr ON i.producto_id = pr.id
                    WHERE p.id = NEW.participantes_id;
                END IF;
            END IF;
        END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ====================================
-- 3. CREAR TRIGGERS
-- ====================================

SELECT '=== CREANDO TRIGGERS ===' as info;

-- Trigger para participantes
DROP TRIGGER IF EXISTS trigger_sincronizar_historial_participantes_automatico ON reclutamientos;
CREATE TRIGGER trigger_sincronizar_historial_participantes_automatico
    AFTER UPDATE ON reclutamientos
    FOR EACH ROW
    EXECUTE FUNCTION sincronizar_historial_participantes_automatico();

-- Trigger para empresas
DROP TRIGGER IF EXISTS trigger_insertar_historial_empresa_automatico ON reclutamientos;
CREATE TRIGGER trigger_insertar_historial_empresa_automatico
    AFTER UPDATE ON reclutamientos
    FOR EACH ROW
    EXECUTE FUNCTION insertar_historial_empresa_automatico();

-- ====================================
-- 4. VERIFICAR TRIGGERS CREADOS
-- ====================================

SELECT '=== VERIFICANDO TRIGGERS CREADOS ===' as info;

-- Verificar que los triggers existen
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'reclutamientos'
AND trigger_name IN (
    'trigger_sincronizar_historial_participantes_automatico',
    'trigger_insertar_historial_empresa_automatico'
)
ORDER BY trigger_name;

-- ====================================
-- 5. VERIFICAR FUNCIONES CREADAS
-- ====================================

SELECT '=== VERIFICANDO FUNCIONES CREADAS ===' as info;

-- Verificar que las funciones existen
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_name IN (
    'sincronizar_historial_participantes_automatico',
    'insertar_historial_empresa_automatico'
)
ORDER BY routine_name;

-- ====================================
-- 6. PROBAR CON UN RECLUTAMIENTO EXISTENTE
-- ====================================

SELECT '=== PROBANDO CON RECLUTAMIENTO EXISTENTE ===' as info;

-- Verificar estado actual antes de la prueba
SELECT 
    'Estado antes de prueba' as info,
    (SELECT COUNT(*) FROM historial_participacion_participantes) as historial_participantes,
    (SELECT COUNT(*) FROM historial_participacion_empresas) as historial_empresas;

-- ====================================
-- 7. INSTRUCCIONES PARA PRUEBA
-- ====================================

SELECT '=== INSTRUCCIONES PARA PRUEBA ===' as info;
SELECT '1. Crea una nueva participación en la aplicación' as paso1;
SELECT '2. Finaliza la participación (cambia estado a Finalizado)' as paso2;
SELECT '3. Verifica que las estadísticas se actualicen automáticamente' as paso3;
SELECT '4. Si no funciona, ejecuta el script de diagnóstico' as paso4;

-- ====================================
-- 8. VERIFICACIÓN FINAL
-- ====================================

SELECT '=== VERIFICACIÓN FINAL ===' as info;

-- Verificar que todo está listo
SELECT 
    'Estado final después de crear triggers' as info,
    (SELECT COUNT(*) FROM historial_participacion_participantes) as historial_participantes,
    (SELECT COUNT(*) FROM historial_participacion_empresas) as historial_empresas,
    (SELECT COUNT(*) FROM information_schema.triggers WHERE event_object_table = 'reclutamientos') as triggers_activos;

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== TRIGGERS AUTOMÁTICOS RECREADOS ===' as info;
SELECT 'Los triggers han sido recreados y deberían funcionar automáticamente.' as mensaje;
SELECT 'Ahora cuando finalices una participación, se sumará automáticamente a las estadísticas.' as instruccion;
SELECT 'Prueba creando y finalizando una nueva participación para verificar.' as siguiente_paso; 