-- ====================================
-- LIMPIAR Y RECONSTRUIR ESTADÍSTICAS
-- ====================================
-- Problema: Las estadísticas muestran números incorrectos
-- Solución: Limpiar todo y reconstruir desde cero
-- Objetivo: Garantizar que las estadísticas sean exactas

-- ====================================
-- 1. LIMPIAR TODO COMPLETAMENTE
-- ====================================

SELECT '=== LIMPIANDO TODO COMPLETAMENTE ===' as info;

-- Eliminar TODO el historial
DELETE FROM historial_participacion_participantes;
DELETE FROM historial_participacion_empresas;

-- Eliminar todos los triggers existentes
DROP TRIGGER IF EXISTS trigger_sincronizar_historial_completo ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_sincronizar_historial_participantes_automatico ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_insertar_historial_empresa_automatico ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_sincronizar_historial_participantes_final ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_insertar_historial_empresa_final ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_sincronizar_historial_participantes_solo_finalizadas ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_insertar_historial_empresa_solo_finalizadas ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_sincronizar_historial_participantes_limpio ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_insertar_historial_empresa_limpio ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_sincronizar_historial_participantes_corregida ON reclutamientos;

-- Eliminar todas las funciones existentes
DROP FUNCTION IF EXISTS sincronizar_historial_completo() CASCADE;
DROP FUNCTION IF EXISTS sincronizar_historial_participantes_automatico() CASCADE;
DROP FUNCTION IF EXISTS insertar_historial_empresa_automatico() CASCADE;
DROP FUNCTION IF EXISTS sincronizar_historial_participantes_final() CASCADE;
DROP FUNCTION IF EXISTS insertar_historial_empresa_final() CASCADE;
DROP FUNCTION IF EXISTS sincronizar_historial_participantes_solo_finalizadas() CASCADE;
DROP FUNCTION IF EXISTS insertar_historial_empresa_solo_finalizadas() CASCADE;
DROP FUNCTION IF EXISTS sincronizar_historial_participantes_limpio() CASCADE;
DROP FUNCTION IF EXISTS insertar_historial_empresa_limpio() CASCADE;
DROP FUNCTION IF EXISTS sincronizar_historial_participantes_corregida() CASCADE;

-- Verificar que está completamente limpio
SELECT 
    'Estado después de limpieza completa' as info,
    (SELECT COUNT(*) FROM historial_participacion_participantes) as historial_participantes,
    (SELECT COUNT(*) FROM historial_participacion_empresas) as historial_empresas,
    (SELECT COUNT(*) FROM information_schema.triggers WHERE event_object_table = 'reclutamientos') as triggers_activos;

-- ====================================
-- 2. VERIFICAR RECLUTAMIENTOS FINALIZADOS
-- ====================================

SELECT '=== VERIFICANDO RECLUTAMIENTOS FINALIZADOS ===' as info;

-- Verificar cuántos reclutamientos están realmente finalizados
SELECT 
    'Reclutamientos realmente finalizados' as info,
    COUNT(*) as total_finalizados
FROM reclutamientos 
WHERE participantes_id IS NOT NULL
AND estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
);

-- Mostrar detalles de los reclutamientos finalizados
SELECT 
    'Detalle de reclutamientos finalizados' as info,
    r.id as reclutamiento_id,
    r.participantes_id,
    p.nombre as participante,
    e.nombre as empresa,
    r.fecha_sesion,
    r.duracion_sesion
FROM reclutamientos r
JOIN participantes p ON r.participantes_id = p.id
LEFT JOIN empresas e ON p.empresa_id = e.id
WHERE r.participantes_id IS NOT NULL
AND r.estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
)
ORDER BY p.nombre, r.id;

-- ====================================
-- 3. INSERTAR MANUALMENTE PARTICIPANTES
-- ====================================

SELECT '=== INSERTANDO MANUALMENTE PARTICIPANTES ===' as info;

-- Insertar en historial de participantes SOLO los realmente finalizados
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

-- ====================================
-- 4. INSERTAR MANUALMENTE EMPRESAS
-- ====================================

SELECT '=== INSERTANDO MANUALMENTE EMPRESAS ===' as info;

-- Insertar en historial de empresas SOLO los realmente finalizados
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

-- ====================================
-- 5. VERIFICAR RESULTADO INMEDIATO
-- ====================================

SELECT '=== VERIFICANDO RESULTADO INMEDIATO ===' as info;

-- Verificar estadísticas finales
SELECT 
    'Estadísticas finales' as info,
    (SELECT COUNT(*) FROM historial_participacion_participantes) as historial_participantes,
    (SELECT COUNT(*) FROM historial_participacion_empresas) as historial_empresas;

-- Verificar que solo hay finalizadas en el historial
SELECT 
    'Verificación de finalizadas en historial participantes' as info,
    COUNT(*) as total_finalizadas_en_historial
FROM historial_participacion_participantes h
JOIN reclutamientos r ON h.reclutamiento_id = r.id
WHERE r.estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
);

SELECT 
    'Verificación de finalizadas en historial empresas' as info,
    COUNT(*) as total_finalizadas_en_historial
FROM historial_participacion_empresas h
JOIN reclutamientos r ON h.reclutamiento_id = r.id
WHERE r.estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
);

-- ====================================
-- 6. CREAR TRIGGER SIMPLE Y SEGURO
-- ====================================

SELECT '=== CREANDO TRIGGER SIMPLE Y SEGURO ===' as info;

-- Crear función simple para participantes
CREATE OR REPLACE FUNCTION insertar_historial_participante_simple()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo insertar si está finalizado y no existe ya
    IF NEW.estado_agendamiento = (
        SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
    ) AND NEW.participantes_id IS NOT NULL 
    AND NOT EXISTS (
        SELECT 1 FROM historial_participacion_participantes 
        WHERE reclutamiento_id = NEW.id
    ) THEN
        
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
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear función simple para empresas
CREATE OR REPLACE FUNCTION insertar_historial_empresa_simple()
RETURNS TRIGGER AS $$
DECLARE
    empresa_id_participante UUID;
BEGIN
    -- Solo insertar si está finalizado y no existe ya
    IF NEW.estado_agendamiento = (
        SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
    ) AND NEW.participantes_id IS NOT NULL THEN
        
        -- Obtener empresa del participante
        SELECT empresa_id INTO empresa_id_participante
        FROM participantes
        WHERE id = NEW.participantes_id;
        
        -- Solo insertar si tiene empresa y no existe ya
        IF empresa_id_participante IS NOT NULL 
        AND NOT EXISTS (
            SELECT 1 FROM historial_participacion_empresas 
            WHERE reclutamiento_id = NEW.id
        ) THEN
            
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
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear triggers separados y simples
CREATE TRIGGER trigger_insertar_historial_participante_simple
    AFTER UPDATE ON reclutamientos
    FOR EACH ROW
    EXECUTE FUNCTION insertar_historial_participante_simple();

CREATE TRIGGER trigger_insertar_historial_empresa_simple
    AFTER UPDATE ON reclutamientos
    FOR EACH ROW
    EXECUTE FUNCTION insertar_historial_empresa_simple();

-- ====================================
-- 7. VERIFICAR TRIGGERS CREADOS
-- ====================================

SELECT '=== VERIFICANDO TRIGGERS CREADOS ===' as info;

-- Verificar que los triggers existen
SELECT 
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers
WHERE event_object_table = 'reclutamientos'
AND trigger_name IN (
    'trigger_insertar_historial_participante_simple',
    'trigger_insertar_historial_empresa_simple'
)
ORDER BY trigger_name;

-- ====================================
-- 8. PROBAR CON UN RECLUTAMIENTO EXISTENTE
-- ====================================

SELECT '=== PROBANDO CON RECLUTAMIENTO EXISTENTE ===' as info;

-- Verificar estado antes de la prueba
SELECT 
    'Estado antes de prueba' as info,
    (SELECT COUNT(*) FROM historial_participacion_participantes) as historial_participantes,
    (SELECT COUNT(*) FROM historial_participacion_empresas) as historial_empresas;

-- Simular finalización de un reclutamiento para probar el trigger
UPDATE reclutamientos 
SET 
    estado_agendamiento = (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado')
WHERE id = (
    SELECT r.id
    FROM reclutamientos r
    WHERE r.participantes_id IS NOT NULL
    AND r.estado_agendamiento != (
        SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
    )
    LIMIT 1
);

-- Verificar estado después de la prueba
SELECT 
    'Estado después de prueba' as info,
    (SELECT COUNT(*) FROM historial_participacion_participantes) as historial_participantes,
    (SELECT COUNT(*) FROM historial_participacion_empresas) as historial_empresas;

-- ====================================
-- 9. VERIFICAR CORRESPONDENCIA EXACTA
-- ====================================

SELECT '=== VERIFICANDO CORRESPONDENCIA EXACTA ===' as info;

-- Verificar que el número de reclutamientos finalizados coincide con el historial
SELECT 
    'Correspondencia finalizados vs historial' as info,
    (SELECT COUNT(*) FROM reclutamientos WHERE participantes_id IS NOT NULL AND estado_agendamiento = (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado')) as reclutamientos_finalizados,
    (SELECT COUNT(*) FROM historial_participacion_participantes) as en_historial_participantes,
    (SELECT COUNT(*) FROM historial_participacion_empresas) as en_historial_empresas;

-- ====================================
-- 10. INSTRUCCIONES PARA PRUEBA MANUAL
-- ====================================

SELECT '=== INSTRUCCIONES PARA PRUEBA MANUAL ===' as info;
SELECT '1. Ve a la aplicación y crea una nueva participación' as paso1;
SELECT '2. Cambia el estado de la participación a "Finalizado"' as paso2;
SELECT '3. Verifica que las estadísticas se actualicen correctamente' as paso3;
SELECT '4. Si funciona, el problema está solucionado' as paso4;

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== LIMPIEZA Y RECONSTRUCCIÓN COMPLETADA ===' as info;
SELECT 'Todo ha sido limpiado y reconstruido desde cero.' as mensaje;
SELECT 'Se han creado triggers simples y seguros.' as explicacion;
SELECT 'Prueba creando y finalizando una nueva participación para verificar.' as siguiente_paso; 