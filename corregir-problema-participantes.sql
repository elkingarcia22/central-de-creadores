-- ====================================
-- CORREGIR PROBLEMA ESPECÍFICO CON PARTICIPANTES
-- ====================================
-- Problema: Al crear nueva participación, el contador de participantes suma 1 extra
-- Causa: Posible problema con triggers o duplicados en historial
-- Solución: Limpiar y corregir específicamente el historial de participantes

-- ====================================
-- 1. LIMPIAR HISTORIAL DE PARTICIPANTES
-- ====================================

SELECT '=== LIMPIANDO HISTORIAL DE PARTICIPANTES ===' as info;

-- Eliminar todo el historial de participantes
DELETE FROM historial_participacion_participantes;

-- Verificar que está limpio
SELECT 
    'Historial participantes después de limpieza' as info,
    COUNT(*) as total_en_historial
FROM historial_participacion_participantes;

-- ====================================
-- 2. VERIFICAR RECLUTAMIENTOS FINALIZADOS
-- ====================================

SELECT '=== VERIFICANDO RECLUTAMIENTOS FINALIZADOS ===' as info;

-- Verificar cuántos reclutamientos están finalizados
SELECT 
    'Reclutamientos finalizados' as info,
    COUNT(*) as total_finalizados
FROM reclutamientos 
WHERE participantes_id IS NOT NULL
AND estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
);

-- Mostrar los reclutamientos finalizados
SELECT 
    'Detalle de finalizados' as info,
    r.id,
    r.participantes_id,
    p.nombre as participante,
    e.nombre as empresa
FROM reclutamientos r
JOIN participantes p ON r.participantes_id = p.id
LEFT JOIN empresas e ON p.empresa_id = e.id
WHERE r.participantes_id IS NOT NULL
AND r.estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
)
ORDER BY r.id;

-- ====================================
-- 3. INSERTAR SOLO FINALIZADAS EN HISTORIAL DE PARTICIPANTES
-- ====================================

SELECT '=== INSERTANDO SOLO FINALIZADAS EN HISTORIAL DE PARTICIPANTES ===' as info;

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
-- 4. VERIFICAR RESULTADO
-- ====================================

SELECT '=== VERIFICANDO RESULTADO ===' as info;

-- Verificar historial después de inserción
SELECT 
    'Historial participantes después de inserción' as info,
    COUNT(*) as total_en_historial
FROM historial_participacion_participantes;

-- Verificar que solo hay finalizadas en el historial
SELECT 
    'Verificación de finalizadas en historial' as info,
    COUNT(*) as total_finalizadas_en_historial
FROM historial_participacion_participantes h
JOIN reclutamientos r ON h.reclutamiento_id = r.id
WHERE r.estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
);

-- ====================================
-- 5. VERIFICAR ESTADÍSTICAS POR PARTICIPANTE
-- ====================================

SELECT '=== ESTADÍSTICAS POR PARTICIPANTE ===' as info;

-- Verificar participaciones por participante (todas)
SELECT 
    p.nombre as participante,
    COUNT(*) as total_participaciones
FROM reclutamientos r
JOIN participantes p ON r.participantes_id = p.id
WHERE r.participantes_id IS NOT NULL
GROUP BY p.id, p.nombre
ORDER BY total_participaciones DESC;

-- Verificar participaciones por participante (solo finalizadas)
SELECT 
    p.nombre as participante,
    COUNT(*) as finalizadas
FROM reclutamientos r
JOIN participantes p ON r.participantes_id = p.id
WHERE r.participantes_id IS NOT NULL
AND r.estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
)
GROUP BY p.id, p.nombre
ORDER BY finalizadas DESC;

-- Verificar participaciones por participante en historial
SELECT 
    p.nombre as participante,
    COUNT(*) as en_historial
FROM historial_participacion_participantes h
JOIN participantes p ON h.participante_id = p.id
GROUP BY p.id, p.nombre
ORDER BY en_historial DESC;

-- ====================================
-- 6. VERIFICAR QUE NO HAY DUPLICADOS
-- ====================================

SELECT '=== VERIFICANDO DUPLICADOS ===' as info;

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

-- Verificar duplicados por participante
SELECT 
    p.nombre as participante,
    h.reclutamiento_id,
    COUNT(*) as duplicados
FROM historial_participacion_participantes h
JOIN participantes p ON h.participante_id = p.id
GROUP BY p.id, p.nombre, h.reclutamiento_id
HAVING COUNT(*) > 1
ORDER BY p.nombre, h.reclutamiento_id;

-- ====================================
-- 7. CORREGIR FUNCIÓN PARA PARTICIPANTES
-- ====================================

SELECT '=== CORRIGIENDO FUNCIÓN PARA PARTICIPANTES ===' as info;

-- Eliminar función anterior si existe
DROP FUNCTION IF EXISTS sincronizar_historial_participantes_solo_finalizadas() CASCADE;
DROP FUNCTION IF EXISTS sincronizar_historial_participantes_limpio() CASCADE;

-- Crear función corregida para participantes
CREATE OR REPLACE FUNCTION sincronizar_historial_participantes_corregida()
RETURNS TRIGGER AS $$
DECLARE
    estado_finalizado_id uuid;
    empresa_default_id uuid;
BEGIN
    -- Obtener ID del estado 'Finalizado' específicamente
    SELECT id INTO estado_finalizado_id 
    FROM estado_agendamiento_cat 
    WHERE nombre = 'Finalizado';
    
    -- Solo insertar si el estado cambia a finalizado
    IF NEW.estado_agendamiento = estado_finalizado_id 
    AND (OLD.estado_agendamiento IS NULL OR OLD.estado_agendamiento != estado_finalizado_id) THEN
        
        -- Obtener empresa por defecto
        SELECT id INTO empresa_default_id
        FROM empresas 
        LIMIT 1;
        
        -- Verificar si ya existe en el historial para evitar duplicados
        IF NOT EXISTS (
            SELECT 1 FROM historial_participacion_participantes 
            WHERE reclutamiento_id = NEW.id
        ) THEN
            -- Insertar en el historial solo para finalizadas
            INSERT INTO historial_participacion_participantes (
                participante_id,
                investigacion_id,
                reclutamiento_id,
                empresa_id,
                fecha_participacion,
                estado_sesion,
                duracion_sesion,
                creado_por
            ) VALUES (
                NEW.participantes_id,
                NEW.investigacion_id,
                NEW.id,
                COALESCE((SELECT empresa_id FROM participantes WHERE id = NEW.participantes_id), empresa_default_id),
                COALESCE(NEW.fecha_sesion, NOW()),
                'completada',
                COALESCE(NEW.duracion_sesion, 60),
                COALESCE(NEW.creado_por, auth.uid())
            );
            
            RAISE NOTICE 'Historial de participante insertado (solo finalizada): %', NEW.id;
        ELSE
            RAISE NOTICE 'Ya existe en historial, no se inserta duplicado: %', NEW.id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ====================================
-- 8. CREAR TRIGGER CORREGIDO
-- ====================================

SELECT '=== CREANDO TRIGGER CORREGIDO ===' as info;

-- Eliminar triggers anteriores
DROP TRIGGER IF EXISTS trigger_sincronizar_historial_participantes_solo_finalizadas ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_sincronizar_historial_participantes_limpio ON reclutamientos;

-- Crear trigger corregido
CREATE TRIGGER trigger_sincronizar_historial_participantes_corregida
    AFTER UPDATE ON reclutamientos
    FOR EACH ROW
    WHEN (OLD.participantes_id IS NOT NULL)
    EXECUTE FUNCTION sincronizar_historial_participantes_corregida();

-- ====================================
-- 9. VERIFICAR TRIGGERS ACTIVOS
-- ====================================

SELECT '=== VERIFICAR TRIGGERS ACTIVOS ===' as info;

-- Verificar triggers activos
SELECT 
    'Triggers activos para participantes' as info,
    trigger_name,
    event_manipulation
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND event_object_table = 'reclutamientos'
AND trigger_name LIKE '%participante%'
ORDER BY trigger_name;

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== CORRECCIÓN DE PARTICIPANTES COMPLETADA ===' as info;
SELECT 'El historial de participantes ha sido limpiado y corregido.' as mensaje;
SELECT 'Ahora las estadísticas de participantes deberían mostrar solo las finalizadas.' as instruccion; 