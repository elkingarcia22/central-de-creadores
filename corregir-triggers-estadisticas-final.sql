-- ====================================
-- CORREGIR TRIGGERS PARA ESTADÍSTICAS FINAL
-- ====================================
-- Problema: Los triggers insertan en historial incluso cuando el reclutamiento no está finalizado
-- Causa: Los triggers no verifican correctamente el estado 'Finalizado'
-- Solución: Corregir triggers para que solo inserten reclutamientos realmente finalizados

-- ====================================
-- 1. LIMPIAR HISTORIAL INCORRECTO
-- ====================================

SELECT '=== LIMPIANDO HISTORIAL INCORRECTO ===' as info;

-- Eliminar registros del historial que no corresponden a reclutamientos finalizados
DELETE FROM historial_participacion_empresas 
WHERE reclutamiento_id IN (
    SELECT r.id 
    FROM reclutamientos r
    WHERE r.estado_agendamiento != (
        SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
    )
);

DELETE FROM historial_participacion_participantes 
WHERE reclutamiento_id IN (
    SELECT r.id 
    FROM reclutamientos r
    WHERE r.estado_agendamiento != (
        SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
    )
);

-- Verificar limpieza
SELECT 
    'Historial después de limpieza' as info,
    (SELECT COUNT(*) FROM historial_participacion_empresas) as historial_empresas,
    (SELECT COUNT(*) FROM historial_participacion_participantes) as historial_participantes;

-- ====================================
-- 2. ELIMINAR TODOS LOS TRIGGERS EXISTENTES
-- ====================================

SELECT '=== ELIMINANDO TRIGGERS EXISTENTES ===' as info;

-- Eliminar todas las funciones y triggers relacionados con historial
DROP FUNCTION IF EXISTS insertar_historial_empresa_solo_finalizadas() CASCADE;
DROP FUNCTION IF EXISTS sincronizar_historial_participantes_solo_finalizadas() CASCADE;
DROP FUNCTION IF EXISTS insertar_historial_empresa_limpio() CASCADE;
DROP FUNCTION IF EXISTS sincronizar_historial_participantes_limpio() CASCADE;
DROP FUNCTION IF EXISTS sincronizar_historial_participantes_corregida() CASCADE;

-- Eliminar todos los triggers
DROP TRIGGER IF EXISTS trigger_insertar_historial_empresa_solo_finalizadas ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_sincronizar_historial_participantes_solo_finalizadas ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_insertar_historial_empresa_limpio ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_sincronizar_historial_participantes_limpio ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_sincronizar_historial_participantes_corregida ON reclutamientos;

-- ====================================
-- 3. CREAR FUNCIÓN CORREGIDA PARA EMPRESAS
-- ====================================

SELECT '=== CREANDO FUNCIÓN CORREGIDA PARA EMPRESAS ===' as info;

CREATE OR REPLACE FUNCTION insertar_historial_empresa_final()
RETURNS TRIGGER AS $$
DECLARE
    estado_finalizado_id uuid;
    empresa_id_val uuid;
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
                -- Insertar en el historial solo para finalizadas
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
                
                RAISE NOTICE 'Historial de empresa insertado (solo finalizada): %', NEW.id;
            ELSE
                RAISE NOTICE 'Ya existe en historial, no se inserta duplicado: %', NEW.id;
            END IF;
        ELSE
            RAISE NOTICE 'No se pudo asignar empresa_id para participante: %', NEW.participantes_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ====================================
-- 4. CREAR FUNCIÓN CORREGIDA PARA PARTICIPANTES
-- ====================================

CREATE OR REPLACE FUNCTION sincronizar_historial_participantes_final()
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
-- 5. CREAR TRIGGERS CORREGIDOS
-- ====================================

SELECT '=== CREANDO TRIGGERS CORREGIDOS ===' as info;

-- Crear triggers corregidos
CREATE TRIGGER trigger_insertar_historial_empresa_final
    AFTER UPDATE ON reclutamientos
    FOR EACH ROW
    EXECUTE FUNCTION insertar_historial_empresa_final();

CREATE TRIGGER trigger_sincronizar_historial_participantes_final
    AFTER UPDATE ON reclutamientos
    FOR EACH ROW
    WHEN (OLD.participantes_id IS NOT NULL)
    EXECUTE FUNCTION sincronizar_historial_participantes_final();

-- ====================================
-- 6. INSERTAR SOLO FINALIZADAS EN HISTORIAL
-- ====================================

SELECT '=== INSERTANDO SOLO FINALIZADAS EN HISTORIAL ===' as info;

-- Insertar solo reclutamientos finalizados en historial de empresas
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
WHERE r.estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
)
AND r.participantes_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM historial_participacion_empresas h 
    WHERE h.reclutamiento_id = r.id
);

-- Insertar solo reclutamientos finalizados en historial de participantes
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
AND r.participantes_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM historial_participacion_participantes h 
    WHERE h.reclutamiento_id = r.id
);

-- ====================================
-- 7. VERIFICAR RESULTADO FINAL
-- ====================================

SELECT '=== VERIFICACIÓN FINAL ===' as info;

-- Verificar estadísticas corregidas
SELECT 
    'Estadísticas corregidas' as info,
    (SELECT COUNT(*) FROM historial_participacion_empresas) as historial_empresas,
    (SELECT COUNT(*) FROM historial_participacion_participantes) as historial_participantes;

-- Verificar que solo hay finalizadas en el historial
SELECT 
    'Verificación de finalizadas en historial' as info,
    COUNT(*) as total_finalizadas_en_historial
FROM historial_participacion_empresas h
JOIN reclutamientos r ON h.reclutamiento_id = r.id
WHERE r.estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
);

-- Verificar triggers activos
SELECT 
    'Triggers activos finales' as info,
    trigger_name,
    event_manipulation
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND event_object_table = 'reclutamientos'
AND trigger_name LIKE '%final%'
ORDER BY trigger_name;

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== CORRECCIÓN FINAL COMPLETADA ===' as info;
SELECT 'Los triggers han sido corregidos para solo insertar reclutamientos finalizados.' as mensaje;
SELECT 'Ahora las estadísticas deberían mostrar solo las participaciones finalizadas.' as instruccion; 