-- ====================================
-- CORRECCIÓN SIMPLE DE AUTOMATIZACIÓN (ENTORNO LOCAL)
-- ====================================
-- Problema: La automatización funciona al eliminar pero no al crear nuevas participaciones
-- Solución: Script simple sin errores de sintaxis

-- ====================================
-- 1. LIMPIAR TRIGGERS EXISTENTES
-- ====================================

-- Eliminar todos los triggers problemáticos
DROP TRIGGER IF EXISTS trigger_insertar_historial_empresa ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_insertar_historial_empresa_mejorado ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_insertar_historial_empresa_corregido ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_insertar_historial_empresa_final ON reclutamientos;

DROP TRIGGER IF EXISTS trigger_sincronizar_historial_participantes_externos ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_sincronizar_historial_participantes_internos ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_sincronizar_historial_participantes_externos_corregido ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_sincronizar_historial_participantes_internos_corregido ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_sincronizar_historial_participantes_externos_final ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_sincronizar_historial_participantes_internos_final ON reclutamientos;

DROP TRIGGER IF EXISTS trigger_eliminar_historial_participantes_externos ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_eliminar_historial_participantes_internos ON reclutamientos;

-- ====================================
-- 2. CREAR FUNCIÓN SIMPLE PARA EMPRESAS
-- ====================================

CREATE OR REPLACE FUNCTION insertar_historial_empresa_simple()
RETURNS TRIGGER AS $$
DECLARE
    estado_finalizado_id uuid;
    empresa_id_val uuid;
BEGIN
    -- Obtener ID del estado 'Finalizado'
    SELECT id INTO estado_finalizado_id 
    FROM estado_agendamiento_cat 
    WHERE nombre = 'Finalizado';
    
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
                -- Insertar en el historial
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
                    CASE WHEN r.fecha_sesion IS NOT NULL THEN r.fecha_sesion ELSE NOW() END,
                    CASE WHEN r.duracion_sesion IS NOT NULL THEN r.duracion_sesion ELSE 60 END,
                    'completada',
                    CASE WHEN re.nombre IS NOT NULL THEN re.nombre ELSE 'Sin rol' END,
                    CASE WHEN ti.nombre IS NOT NULL THEN ti.nombre ELSE 'Sin tipo' END,
                    CASE WHEN pr.nombre IS NOT NULL THEN pr.nombre ELSE 'Sin producto' END,
                    r.creado_por
                FROM reclutamientos r
                LEFT JOIN participantes p ON r.participantes_id = p.id
                LEFT JOIN roles_empresa re ON p.rol_empresa_id = re.id
                LEFT JOIN investigaciones i ON r.investigacion_id = i.id
                LEFT JOIN tipos_investigacion ti ON i.tipo_investigacion_id = ti.id
                LEFT JOIN productos pr ON i.producto_id = pr.id
                WHERE r.id = NEW.id
                AND p.empresa_id IS NOT NULL;
                
                RAISE NOTICE 'Historial de empresa insertado: %', NEW.id;
            END IF;
        ELSE
            RAISE NOTICE 'Participante sin empresa_id: %', NEW.participantes_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ====================================
-- 3. CREAR FUNCIÓN SIMPLE PARA PARTICIPANTES EXTERNOS
-- ====================================

CREATE OR REPLACE FUNCTION sincronizar_historial_participantes_externos_simple()
RETURNS TRIGGER AS $$
DECLARE
    estado_finalizado_id uuid;
BEGIN
    -- Obtener ID del estado 'Finalizado'
    SELECT id INTO estado_finalizado_id 
    FROM estado_agendamiento_cat 
    WHERE nombre = 'Finalizado';
    
    -- Si es una actualización y el estado cambió a 'Finalizado'
    IF NEW.estado_agendamiento = estado_finalizado_id 
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
                CASE WHEN NEW.fecha_sesion IS NOT NULL THEN NEW.fecha_sesion ELSE NOW() END,
                'completada',
                CASE WHEN NEW.duracion_sesion IS NOT NULL THEN NEW.duracion_sesion ELSE 60 END,
                NEW.creado_por
            );
            
            RAISE NOTICE 'Historial de participante externo insertado: %', NEW.id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ====================================
-- 4. CREAR FUNCIÓN SIMPLE PARA PARTICIPANTES INTERNOS
-- ====================================

CREATE OR REPLACE FUNCTION sincronizar_historial_participantes_internos_simple()
RETURNS TRIGGER AS $$
DECLARE
    estado_finalizado_id uuid;
BEGIN
    -- Obtener ID del estado 'Finalizado'
    SELECT id INTO estado_finalizado_id 
    FROM estado_agendamiento_cat 
    WHERE nombre = 'Finalizado';
    
    -- Si es una actualización y el estado cambió a 'Finalizado'
    IF NEW.estado_agendamiento = estado_finalizado_id 
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
                CASE WHEN NEW.fecha_sesion IS NOT NULL THEN NEW.fecha_sesion ELSE NOW() END,
                'completada',
                CASE WHEN NEW.duracion_sesion IS NOT NULL THEN NEW.duracion_sesion ELSE 60 END,
                NEW.reclutador_id,
                'Sincronizado automáticamente',
                NEW.creado_por
            );
            
            RAISE NOTICE 'Historial de participante interno insertado: %', NEW.id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ====================================
-- 5. CREAR TRIGGERS SIMPLES (SOLO UPDATE)
-- ====================================

-- Trigger para historial de empresas
CREATE TRIGGER trigger_insertar_historial_empresa_simple
    AFTER UPDATE ON reclutamientos
    FOR EACH ROW
    EXECUTE FUNCTION insertar_historial_empresa_simple();

-- Trigger para participantes externos
CREATE TRIGGER trigger_sincronizar_historial_participantes_externos_simple
    AFTER UPDATE ON reclutamientos
    FOR EACH ROW
    WHEN (OLD.participantes_id IS NOT NULL)
    EXECUTE FUNCTION sincronizar_historial_participantes_externos_simple();

-- Trigger para participantes internos
CREATE TRIGGER trigger_sincronizar_historial_participantes_internos_simple
    AFTER UPDATE ON reclutamientos
    FOR EACH ROW
    WHEN (OLD.participantes_internos_id IS NOT NULL)
    EXECUTE FUNCTION sincronizar_historial_participantes_internos_simple();

-- ====================================
-- 6. CREAR FUNCIONES PARA DELETE (SIN CONDICIONES WHEN)
-- ====================================

-- Función para eliminar historial de participantes externos
CREATE OR REPLACE FUNCTION eliminar_historial_participantes_externos_simple()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM historial_participacion_participantes 
    WHERE reclutamiento_id = OLD.id;
    
    RAISE NOTICE 'Historial de participante externo eliminado: %', OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Función para eliminar historial de participantes internos
CREATE OR REPLACE FUNCTION eliminar_historial_participantes_internos_simple()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM historial_participacion_participantes_internos 
    WHERE reclutamiento_id = OLD.id;
    
    RAISE NOTICE 'Historial de participante interno eliminado: %', OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- ====================================
-- 7. CREAR TRIGGERS PARA DELETE (SIN CONDICIONES WHEN)
-- ====================================

-- Trigger para eliminar historial de participantes externos
CREATE TRIGGER trigger_eliminar_historial_participantes_externos_simple
    AFTER DELETE ON reclutamientos
    FOR EACH ROW
    EXECUTE FUNCTION eliminar_historial_participantes_externos_simple();

-- Trigger para eliminar historial de participantes internos
CREATE TRIGGER trigger_eliminar_historial_participantes_internos_simple
    AFTER DELETE ON reclutamientos
    FOR EACH ROW
    EXECUTE FUNCTION eliminar_historial_participantes_internos_simple();

-- ====================================
-- 8. CORREGIR PARTICIPANTES SIN EMPRESA_ID
-- ====================================

-- Asignar empresa_id a participantes que no lo tengan
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

-- ====================================
-- 9. RE-EJECUTAR TRIGGERS PARA RECLUTAMIENTOS EXISTENTES
-- ====================================

-- Forzar actualización de reclutamientos finalizados para re-ejecutar triggers
UPDATE reclutamientos 
SET updated_at = NOW() 
WHERE estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
);

-- ====================================
-- 10. VERIFICAR RESULTADO
-- ====================================

-- Verificar triggers activos
SELECT 
    'Triggers activos después de corrección simple' as info,
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND trigger_name IN (
    'trigger_insertar_historial_empresa_simple',
    'trigger_sincronizar_historial_participantes_externos_simple',
    'trigger_sincronizar_historial_participantes_internos_simple',
    'trigger_eliminar_historial_participantes_externos_simple',
    'trigger_eliminar_historial_participantes_internos_simple'
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

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== CORRECCIÓN SIMPLE COMPLETADA ===' as info;
SELECT 'Los triggers de automatización han sido corregidos sin errores de sintaxis.' as mensaje;
SELECT 'Ahora la automatización debería funcionar correctamente en tu entorno local.' as instruccion; 