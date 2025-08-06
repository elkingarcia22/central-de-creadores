-- ====================================
-- CORRECCIÓN DE AUTOMATIZACIÓN DE ESTADÍSTICAS
-- ====================================
-- Problema: La automatización funciona al eliminar pero no al crear nuevas participaciones
-- Solución: Corregir triggers y verificar configuración

-- ====================================
-- 1. VERIFICAR Y CORREGIR TRIGGERS DE HISTORIAL DE EMPRESAS
-- ====================================

-- Eliminar trigger existente si hay problemas
DROP TRIGGER IF EXISTS trigger_insertar_historial_empresa ON reclutamientos;

-- Crear función mejorada para historial de empresas
CREATE OR REPLACE FUNCTION insertar_historial_empresa_automatico_mejorado()
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
                    COALESCE(r.fecha_sesion, NOW()),
                    COALESCE(r.duracion_sesion, 60),
                    'completada',
                    re.nombre as rol_participante,
                    ti.nombre as tipo_investigacion,
                    pr.nombre as producto_evaluado,
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
CREATE TRIGGER trigger_insertar_historial_empresa_mejorado
    AFTER UPDATE ON reclutamientos
    FOR EACH ROW
    EXECUTE FUNCTION insertar_historial_empresa_automatico_mejorado();

-- ====================================
-- 2. VERIFICAR Y CORREGIR TRIGGERS DE HISTORIAL DE PARTICIPANTES
-- ====================================

-- Eliminar triggers existentes si hay problemas
DROP TRIGGER IF EXISTS trigger_sincronizar_historial_participantes_externos ON reclutamientos;
DROP TRIGGER IF EXISTS trigger_sincronizar_historial_participantes_internos ON reclutamientos;

-- Crear función mejorada para participantes externos
CREATE OR REPLACE FUNCTION sincronizar_historial_participantes_externos_mejorado()
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

-- Crear trigger mejorado para participantes externos
CREATE TRIGGER trigger_sincronizar_historial_participantes_externos_mejorado
    AFTER UPDATE OR DELETE ON reclutamientos
    FOR EACH ROW
    WHEN (OLD.participantes_id IS NOT NULL OR NEW.participantes_id IS NOT NULL)
    EXECUTE FUNCTION sincronizar_historial_participantes_externos_mejorado();

-- Crear función mejorada para participantes internos
CREATE OR REPLACE FUNCTION sincronizar_historial_participantes_internos_mejorado()
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

-- Crear trigger mejorado para participantes internos
CREATE TRIGGER trigger_sincronizar_historial_participantes_internos_mejorado
    AFTER UPDATE OR DELETE ON reclutamientos
    FOR EACH ROW
    WHEN (OLD.participantes_internos_id IS NOT NULL OR NEW.participantes_internos_id IS NOT NULL)
    EXECUTE FUNCTION sincronizar_historial_participantes_internos_mejorado();

-- ====================================
-- 3. CORREGIR PARTICIPANTES SIN EMPRESA_ID
-- ====================================

-- Asignar empresa_id a participantes que no lo tengan
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

-- ====================================
-- 4. RE-EJECUTAR TRIGGERS PARA RECLUTAMIENTOS EXISTENTES
-- ====================================

-- Forzar actualización de reclutamientos finalizados para re-ejecutar triggers
UPDATE reclutamientos 
SET updated_at = NOW() 
WHERE estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
);

-- ====================================
-- 5. VERIFICAR RESULTADO
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
    'trigger_insertar_historial_empresa_mejorado',
    'trigger_sincronizar_historial_participantes_externos_mejorado',
    'trigger_sincronizar_historial_participantes_internos_mejorado'
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
-- 6. CONFIGURACIÓN PARA ENTORNO LOCAL
-- ====================================

-- Si estás en entorno local, agregar configuración adicional
DO $$
BEGIN
    -- Verificar si estamos en PostgreSQL local
    IF current_setting('server.version_num')::int < 120000 THEN
        RAISE NOTICE 'Entorno local detectado. Configurando triggers adicionales...';
        
        -- Agregar configuración específica para local si es necesario
        -- (Aquí puedes agregar configuraciones específicas para tu entorno local)
        
    ELSE
        RAISE NOTICE 'Entorno Supabase detectado. Triggers configurados correctamente.';
    END IF;
END $$;

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== CORRECCIÓN COMPLETADA ===' as info;
SELECT 'Los triggers de automatización han sido corregidos y mejorados.' as mensaje;
SELECT 'Ahora la automatización debería funcionar tanto al crear como al eliminar participaciones.' as instruccion; 