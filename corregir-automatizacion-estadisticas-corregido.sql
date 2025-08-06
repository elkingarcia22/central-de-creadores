-- ====================================
-- CORRECCIÓN DE AUTOMATIZACIÓN DE ESTADÍSTICAS (CORREGIDO)
-- ====================================
-- Problema: La automatización funciona al eliminar pero no al crear nuevas participaciones
-- Solución: Corregir triggers usando la estructura real de las tablas

-- ====================================
-- 1. VERIFICAR ESTRUCTURA REAL PRIMERO
-- ====================================

-- Verificar estructura de empresas
SELECT '=== ESTRUCTURA EMPRESAS ===' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'empresas' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar estructura de participantes
SELECT '=== ESTRUCTURA PARTICIPANTES ===' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'participantes' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar estructura de estado_agendamiento_cat
SELECT '=== ESTRUCTURA ESTADO_AGENDAMIENTO_CAT ===' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'estado_agendamiento_cat' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- ====================================
-- 2. CORREGIR TRIGGERS DE HISTORIAL DE EMPRESAS
-- ====================================

-- Eliminar trigger existente si hay problemas
DROP TRIGGER IF EXISTS trigger_insertar_historial_empresa ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_insertar_historial_empresa_mejorado ON reclutamientos;

-- Crear función mejorada para historial de empresas (usando estructura real)
CREATE OR REPLACE FUNCTION insertar_historial_empresa_automatico_corregido()
RETURNS TRIGGER AS $$
DECLARE
    estado_finalizado_id uuid;
    empresa_id_val uuid;
    -- Variables para verificar estructura real
    tiene_activo boolean;
    tiene_descripcion boolean;
BEGIN
    -- Verificar si la tabla empresas tiene columna activo
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'empresas' 
        AND column_name = 'activo'
        AND table_schema = 'public'
    ) INTO tiene_activo;
    
    -- Verificar si la tabla estado_agendamiento_cat tiene columna descripcion
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'estado_agendamiento_cat' 
        AND column_name = 'descripcion'
        AND table_schema = 'public'
    ) INTO tiene_descripcion;
    
    -- Obtener ID del estado 'Finalizado' (adaptado a estructura real)
    IF tiene_descripcion THEN
        SELECT id INTO estado_finalizado_id 
        FROM estado_agendamiento_cat 
        WHERE nombre = 'Finalizado';
    ELSE
        SELECT id INTO estado_finalizado_id 
        FROM estado_agendamiento_cat 
        WHERE nombre = 'Finalizado';
    END IF;
    
    -- Solo insertar si el estado cambia a 'Finalizado'
    IF NEW.estado_agendamiento = estado_finalizado_id 
    AND (OLD.estado_agendamiento IS NULL OR OLD.estado_agendamiento != estado_finalizado_id) THEN
        
        -- Obtener empresa_id del participante
        SELECT empresa_id INTO empresa_id_val
        FROM participantes 
        WHERE id = NEW.participantes_id;
        
        -- Solo insertar si el participante tiene empresa_id
        IF empresa_id_val IS NOT NULL THEN
            -- Verificar si ya existe en el historial para evitar duplicados
            IF NOT EXISTS (
                SELECT 1 FROM historial_participacion_empresas 
                WHERE reclutamiento_id = NEW.id
            ) THEN
                -- Insertar en el historial (adaptado a estructura real)
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
                    COALESCE(re.nombre, 'Sin rol') as rol_participante,
                    COALESCE(ti.nombre, 'Sin tipo') as tipo_investigacion,
                    COALESCE(pr.nombre, 'Sin producto') as producto_evaluado,
                    r.creado_por
                FROM reclutamientos r
                LEFT JOIN participantes p ON r.participantes_id = p.id
                LEFT JOIN roles_empresa re ON p.rol_empresa_id = re.id
                LEFT JOIN investigaciones i ON r.investigacion_id = i.id
                LEFT JOIN tipos_investigacion ti ON i.tipo_investigacion_id = ti.id
                LEFT JOIN productos pr ON i.producto_id = pr.id
                WHERE r.id = NEW.id
                AND p.empresa_id IS NOT NULL;
                
                RAISE NOTICE 'Historial de empresa insertado automáticamente para reclutamiento: %', NEW.id;
            END IF;
        ELSE
            RAISE NOTICE 'Participante sin empresa_id, no se insertará en historial: %', NEW.participantes_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger mejorado para historial de empresas
CREATE TRIGGER trigger_insertar_historial_empresa_corregido
    AFTER UPDATE ON reclutamientos
    FOR EACH ROW
    EXECUTE FUNCTION insertar_historial_empresa_automatico_corregido();

-- ====================================
-- 3. CORREGIR TRIGGERS DE HISTORIAL DE PARTICIPANTES
-- ====================================

-- Eliminar triggers existentes si hay problemas
DROP TRIGGER IF EXISTS trigger_sincronizar_historial_participantes_externos ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_sincronizar_historial_participantes_internos ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_sincronizar_historial_participantes_externos_mejorado ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_sincronizar_historial_participantes_internos_mejorado ON reclutamientos;

-- Crear función mejorada para participantes externos (corregida)
CREATE OR REPLACE FUNCTION sincronizar_historial_participantes_externos_corregido()
RETURNS TRIGGER AS $$
DECLARE
    estado_finalizado_id uuid;
BEGIN
    -- Obtener ID del estado 'Finalizado'
    SELECT id INTO estado_finalizado_id 
    FROM estado_agendamiento_cat 
    WHERE nombre = 'Finalizado';
    
    -- Si es una actualización y el estado cambió a 'Finalizado'
    IF TG_OP = 'UPDATE' AND NEW.estado_agendamiento = estado_finalizado_id 
    AND (OLD.estado_agendamiento IS NULL OR OLD.estado_agendamiento != estado_finalizado_id) THEN
        
        -- Verificar si ya existe en el historial para evitar duplicados
        IF NOT EXISTS (
            SELECT 1 FROM historial_participacion_participantes 
            WHERE reclutamiento_id = NEW.id
        ) THEN
            -- Insertar en el historial
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
                (SELECT empresa_id FROM participantes WHERE id = NEW.participantes_id),
                COALESCE(NEW.fecha_sesion, NOW()),
                'completada',
                COALESCE(NEW.duracion_sesion, 60),
                NEW.creado_por
            );
            
            RAISE NOTICE 'Historial de participante externo insertado automáticamente para reclutamiento: %', NEW.id;
        END IF;
    END IF;

    -- Si es una eliminación, eliminar del historial
    IF TG_OP = 'DELETE' THEN
        DELETE FROM historial_participacion_participantes 
        WHERE reclutamiento_id = OLD.id;
        
        RAISE NOTICE 'Historial de participante externo eliminado para reclutamiento: %', OLD.id;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Crear trigger mejorado para participantes externos (corregido)
CREATE TRIGGER trigger_sincronizar_historial_participantes_externos_corregido
    AFTER UPDATE OR DELETE ON reclutamientos
    FOR EACH ROW
    WHEN (OLD.participantes_id IS NOT NULL OR NEW.participantes_id IS NOT NULL)
    EXECUTE FUNCTION sincronizar_historial_participantes_externos_corregido();

-- Crear función mejorada para participantes internos (corregida)
CREATE OR REPLACE FUNCTION sincronizar_historial_participantes_internos_corregido()
RETURNS TRIGGER AS $$
DECLARE
    estado_finalizado_id uuid;
BEGIN
    -- Obtener ID del estado 'Finalizado'
    SELECT id INTO estado_finalizado_id 
    FROM estado_agendamiento_cat 
    WHERE nombre = 'Finalizado';
    
    -- Si es una actualización y el estado cambió a 'Finalizado'
    IF TG_OP = 'UPDATE' AND NEW.estado_agendamiento = estado_finalizado_id 
    AND (OLD.estado_agendamiento IS NULL OR OLD.estado_agendamiento != estado_finalizado_id) THEN
        
        -- Verificar si ya existe en el historial para evitar duplicados
        IF NOT EXISTS (
            SELECT 1 FROM historial_participacion_participantes_internos 
            WHERE reclutamiento_id = NEW.id
        ) THEN
            -- Insertar en el historial
            INSERT INTO historial_participacion_participantes_internos (
                participante_interno_id,
                investigacion_id,
                reclutamiento_id,
                fecha_participacion,
                estado_sesion,
                duracion_minutos,
                reclutador_id,
                observaciones,
                creado_por
            ) VALUES (
                NEW.participantes_internos_id,
                NEW.investigacion_id,
                NEW.id,
                COALESCE(NEW.fecha_sesion, NOW()),
                'completada',
                COALESCE(NEW.duracion_sesion, 60),
                NEW.reclutador_id,
                'Sincronizado automáticamente',
                NEW.creado_por
            );
            
            RAISE NOTICE 'Historial de participante interno insertado automáticamente para reclutamiento: %', NEW.id;
        END IF;
    END IF;

    -- Si es una eliminación, eliminar del historial
    IF TG_OP = 'DELETE' THEN
        DELETE FROM historial_participacion_participantes_internos 
        WHERE reclutamiento_id = OLD.id;
        
        RAISE NOTICE 'Historial de participante interno eliminado para reclutamiento: %', OLD.id;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Crear trigger mejorado para participantes internos (corregido)
CREATE TRIGGER trigger_sincronizar_historial_participantes_internos_corregido
    AFTER UPDATE OR DELETE ON reclutamientos
    FOR EACH ROW
    WHEN (OLD.participantes_internos_id IS NOT NULL OR NEW.participantes_internos_id IS NOT NULL)
    EXECUTE FUNCTION sincronizar_historial_participantes_internos_corregido();

-- ====================================
-- 4. CORREGIR PARTICIPANTES SIN EMPRESA_ID (ADAPTADO)
-- ====================================

-- Verificar si la tabla empresas tiene columna activo antes de usarla
DO $$
DECLARE
    tiene_activo boolean;
BEGIN
    -- Verificar si existe la columna activo
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'empresas' 
        AND column_name = 'activo'
        AND table_schema = 'public'
    ) INTO tiene_activo;
    
    IF tiene_activo THEN
        -- Asignar empresa_id a participantes que no lo tengan (con filtro activo)
        UPDATE participantes 
        SET empresa_id = (
            SELECT id FROM empresas 
            WHERE activo = true 
            ORDER BY created_at 
            LIMIT 1
        )
        WHERE empresa_id IS NULL 
        AND id IN (
            SELECT DISTINCT participantes_id 
            FROM reclutamientos 
            WHERE participantes_id IS NOT NULL
        );
    ELSE
        -- Asignar empresa_id a participantes que no lo tengan (sin filtro activo)
        UPDATE participantes 
        SET empresa_id = (
            SELECT id FROM empresas 
            ORDER BY created_at 
            LIMIT 1
        )
        WHERE empresa_id IS NULL 
        AND id IN (
            SELECT DISTINCT participantes_id 
            FROM reclutamientos 
            WHERE participantes_id IS NOT NULL
        );
    END IF;
    
    RAISE NOTICE 'Participantes sin empresa_id corregidos';
END $$;

-- ====================================
-- 5. RE-EJECUTAR TRIGGERS PARA RECLUTAMIENTOS EXISTENTES
-- ====================================

-- Forzar actualización de reclutamientos finalizados para re-ejecutar triggers
UPDATE reclutamientos 
SET updated_at = NOW() 
WHERE estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
);

-- ====================================
-- 6. VERIFICAR RESULTADO
-- ====================================

-- Verificar triggers activos
SELECT 
    'Triggers activos después de corrección' as info,
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND trigger_name IN (
    'trigger_insertar_historial_empresa_corregido',
    'trigger_sincronizar_historial_participantes_externos_corregido',
    'trigger_sincronizar_historial_participantes_internos_corregido'
);

-- Verificar datos en historiales
SELECT 
    'Historial de empresas' as tabla,
    COUNT(*) as total_registros
FROM historial_participacion_empresas
UNION ALL
SELECT 
    'Historial de participantes externos' as tabla,
    COUNT(*) as total_registros
FROM historial_participacion_participantes
UNION ALL
SELECT 
    'Historial de participantes internos' as tabla,
    COUNT(*) as total_registros
FROM historial_participacion_participantes_internos;

-- Verificar reclutamientos finalizados con historial
SELECT 
    'Reclutamientos finalizados con historial' as info,
    COUNT(*) as total
FROM reclutamientos r
WHERE r.estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
)
AND EXISTS (
    SELECT 1 FROM historial_participacion_empresas h 
    WHERE h.reclutamiento_id = r.id
);

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== CORRECCIÓN COMPLETADA ===' as info;
SELECT 'Los triggers de automatización han sido corregidos usando la estructura real de las tablas.' as mensaje;
SELECT 'Ahora la automatización debería funcionar tanto al crear como al eliminar participaciones.' as instruccion; 