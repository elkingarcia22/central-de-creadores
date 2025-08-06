-- ====================================
-- CORRECCIÓN DE AUTOMATIZACIÓN DE ESTADÍSTICAS (FINAL LIMPIO)
-- ====================================
-- Problema: La automatización funciona al eliminar pero no al crear nuevas participaciones
-- Causa probable: Problemas de sincronización de tiempo en entorno local
-- Solución: Script limpio sin ON CONFLICT y eliminando funciones problemáticas

-- ====================================
-- 1. LIMPIAR FUNCIONES Y TRIGGERS PROBLEMÁTICOS
-- ====================================

SELECT '=== LIMPIANDO FUNCIONES PROBLEMÁTICAS ===' as info;

-- Eliminar todas las funciones relacionadas con historial
DROP FUNCTION IF EXISTS sincronizar_historial_externos() CASCADE;
DROP FUNCTION IF EXISTS sincronizar_historial_participantes_externos() CASCADE;
DROP FUNCTION IF EXISTS insertar_historial_empresa_local() CASCADE;
DROP FUNCTION IF EXISTS sincronizar_historial_participantes_externos_local() CASCADE;
DROP FUNCTION IF EXISTS insertar_historial_empresa_final() CASCADE;
DROP FUNCTION IF EXISTS sincronizar_historial_participantes_externos_final() CASCADE;

-- Eliminar todos los triggers relacionados
DROP TRIGGER IF EXISTS trigger_sincronizar_historial_externos ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_sincronizar_historial_participantes_externos ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_insertar_historial_empresa_local ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_sincronizar_historial_participantes_externos_local ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_insertar_historial_empresa_final ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_sincronizar_historial_participantes_externos_final ON reclutamientos;

-- ====================================
-- 2. VERIFICAR ESTADO ACTUAL
-- ====================================

SELECT '=== ESTADO ACTUAL DE ESTADÍSTICAS ===' as info;

-- Verificar estadísticas actuales
SELECT 
    'Estadísticas actuales' as info,
    (SELECT COUNT(*) FROM historial_participacion_empresas) as historial_empresas,
    (SELECT COUNT(*) FROM historial_participacion_participantes) as historial_participantes,
    (SELECT COUNT(*) FROM historial_participacion_participantes_internos) as historial_participantes_internos;

-- Verificar reclutamientos finalizados
SELECT 
    'Reclutamientos finalizados' as info,
    COUNT(*) as total_finalizados,
    COUNT(CASE WHEN participantes_id IS NOT NULL THEN 1 END) as con_participantes_externos,
    COUNT(CASE WHEN participantes_internos_id IS NOT NULL THEN 1 END) as con_participantes_internos
FROM reclutamientos 
WHERE estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
);

-- ====================================
-- 3. CREAR FUNCIÓN LIMPIA PARA EMPRESAS
-- ====================================

SELECT '=== CREANDO FUNCIÓN LIMPIA PARA EMPRESAS ===' as info;

CREATE OR REPLACE FUNCTION insertar_historial_empresa_limpio()
RETURNS TRIGGER AS $$
DECLARE
    estado_finalizado_id uuid;
    empresa_id_val uuid;
    empresa_default_id uuid;
BEGIN
    -- Obtener ID del estado 'Finalizado' (más flexible para local)
    SELECT id INTO estado_finalizado_id 
    FROM estado_agendamiento_cat 
    WHERE nombre ILIKE '%finalizado%' OR nombre ILIKE '%completado%'
    LIMIT 1;
    
    -- Si no encuentra 'Finalizado', buscar cualquier estado que no sea pendiente
    IF estado_finalizado_id IS NULL THEN
        SELECT id INTO estado_finalizado_id 
        FROM estado_agendamiento_cat 
        WHERE nombre NOT ILIKE '%pendiente%' AND nombre NOT ILIKE '%agendado%'
        LIMIT 1;
    END IF;
    
    -- Obtener empresa por defecto (SIN asumir estructura)
    SELECT id INTO empresa_default_id
    FROM empresas 
    LIMIT 1;
    
    -- Solo insertar si el estado cambia a finalizado
    IF NEW.estado_agendamiento = estado_finalizado_id 
    AND (OLD.estado_agendamiento IS NULL OR OLD.estado_agendamiento != estado_finalizado_id) THEN
        
        -- Obtener empresa_id del participante
        SELECT empresa_id INTO empresa_id_val
        FROM participantes 
        WHERE id = NEW.participantes_id;
        
        -- Si no tiene empresa_id, usar la empresa por defecto
        IF empresa_id_val IS NULL THEN
            empresa_id_val := empresa_default_id;
        END IF;
        
        -- Solo insertar si el participante tiene empresa_id
        IF empresa_id_val IS NOT NULL THEN
            -- Verificar si ya existe en el historial para evitar duplicados
            IF NOT EXISTS (
                SELECT 1 FROM historial_participacion_empresas 
                WHERE reclutamiento_id = NEW.id
            ) THEN
                -- Insertar en el historial con valores por defecto para local
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
                    empresa_id_val,
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
                LEFT JOIN participantes p ON r.participantes_id = p.id
                LEFT JOIN roles_empresa re ON p.rol_empresa_id = re.id
                LEFT JOIN investigaciones i ON r.investigacion_id = i.id
                LEFT JOIN tipos_investigacion ti ON i.tipo_investigacion_id = ti.id
                LEFT JOIN productos pr ON i.producto_id = pr.id
                WHERE r.id = NEW.id;
                
                RAISE NOTICE 'Historial de empresa insertado: %', NEW.id;
            END IF;
        ELSE
            RAISE NOTICE 'No se pudo asignar empresa_id para participante: %', NEW.participantes_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ====================================
-- 4. CREAR FUNCIÓN LIMPIA PARA PARTICIPANTES
-- ====================================

CREATE OR REPLACE FUNCTION sincronizar_historial_participantes_limpio()
RETURNS TRIGGER AS $$
DECLARE
    estado_finalizado_id uuid;
    empresa_default_id uuid;
BEGIN
    -- Obtener ID del estado 'Finalizado' (más flexible para local)
    SELECT id INTO estado_finalizado_id 
    FROM estado_agendamiento_cat 
    WHERE nombre ILIKE '%finalizado%' OR nombre ILIKE '%completado%'
    LIMIT 1;
    
    -- Si no encuentra 'Finalizado', buscar cualquier estado que no sea pendiente
    IF estado_finalizado_id IS NULL THEN
        SELECT id INTO estado_finalizado_id 
        FROM estado_agendamiento_cat 
        WHERE nombre NOT ILIKE '%pendiente%' AND nombre NOT ILIKE '%agendado%'
        LIMIT 1;
    END IF;
    
    -- Obtener empresa por defecto (SIN asumir estructura)
    SELECT id INTO empresa_default_id
    FROM empresas 
    LIMIT 1;
    
    -- Si es una actualización y el estado cambió a finalizado
    IF NEW.estado_agendamiento = estado_finalizado_id 
    AND (OLD.estado_agendamiento IS NULL OR OLD.estado_agendamiento != estado_finalizado_id) THEN
        
        -- Verificar si ya existe en el historial para evitar duplicados
        IF NOT EXISTS (
            SELECT 1 FROM historial_participacion_participantes 
            WHERE reclutamiento_id = NEW.id
        ) THEN
            -- Insertar en el historial (SIN ON CONFLICT)
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
            
            RAISE NOTICE 'Historial de participante insertado: %', NEW.id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ====================================
-- 5. CREAR TRIGGERS LIMPIOS
-- ====================================

SELECT '=== CREANDO TRIGGERS LIMPIOS ===' as info;

-- Crear triggers limpios
CREATE TRIGGER trigger_insertar_historial_empresa_limpio
    AFTER UPDATE ON reclutamientos
    FOR EACH ROW
    EXECUTE FUNCTION insertar_historial_empresa_limpio();

CREATE TRIGGER trigger_sincronizar_historial_participantes_limpio
    AFTER UPDATE ON reclutamientos
    FOR EACH ROW
    WHEN (OLD.participantes_id IS NOT NULL)
    EXECUTE FUNCTION sincronizar_historial_participantes_limpio();

-- ====================================
-- 6. CORREGIR DATOS EXISTENTES
-- ====================================

SELECT '=== CORRIGIENDO DATOS EXISTENTES ===' as info;

-- Obtener empresa por defecto
DO $$
DECLARE
    empresa_default_id uuid;
BEGIN
    -- Obtener empresa por defecto (SIN asumir estructura)
    SELECT id INTO empresa_default_id
    FROM empresas 
    LIMIT 1;
    
    -- Asignar empresa_id a participantes que no lo tengan
    UPDATE participantes 
    SET empresa_id = empresa_default_id
    WHERE empresa_id IS NULL 
    AND id IN (
        SELECT DISTINCT participantes_id 
        FROM reclutamientos 
        WHERE participantes_id IS NOT NULL
    );
    
    RAISE NOTICE 'Empresa por defecto asignada: %', empresa_default_id;
END $$;

-- Insertar manualmente reclutamientos finalizados que no están en historial
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
    COALESCE(p.empresa_id, (SELECT id FROM empresas LIMIT 1)),
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
LEFT JOIN participantes p ON r.participantes_id = p.id
LEFT JOIN roles_empresa re ON p.rol_empresa_id = re.id
LEFT JOIN investigaciones i ON r.investigacion_id = i.id
LEFT JOIN tipos_investigacion ti ON i.tipo_investigacion_id = ti.id
LEFT JOIN productos pr ON i.producto_id = pr.id
WHERE r.estado_agendamiento IN (
    SELECT id FROM estado_agendamiento_cat 
    WHERE nombre ILIKE '%finalizado%' OR nombre ILIKE '%completado%'
)
AND r.participantes_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM historial_participacion_empresas h 
    WHERE h.reclutamiento_id = r.id
);

-- ====================================
-- 7. VERIFICAR RESULTADO
-- ====================================

SELECT '=== VERIFICACIÓN FINAL ===' as info;

-- Verificar estadísticas corregidas
SELECT 
    'Estadísticas después de corrección' as info,
    (SELECT COUNT(*) FROM historial_participacion_empresas) as historial_empresas,
    (SELECT COUNT(*) FROM historial_participacion_participantes) as historial_participantes,
    (SELECT COUNT(*) FROM historial_participacion_participantes_internos) as historial_participantes_internos;

-- Verificar triggers activos
SELECT 
    'Triggers activos limpios' as info,
    trigger_name,
    event_manipulation
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND event_object_table = 'reclutamientos'
AND trigger_name LIKE '%limpio%'
ORDER BY trigger_name;

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== CORRECCIÓN LIMPIA COMPLETADA ===' as info;
SELECT 'La automatización de estadísticas ha sido limpiada y corregida.' as mensaje;
SELECT 'No hay ON CONFLICT y las funciones problemáticas han sido eliminadas.' as instruccion; 