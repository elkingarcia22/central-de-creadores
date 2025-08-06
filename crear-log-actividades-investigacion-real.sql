-- =====================================================
-- SISTEMA DE LOG DE ACTIVIDADES PARA INVESTIGACIONES
-- Adaptado a la estructura real de la tabla investigaciones
-- =====================================================

-- 1. Crear enum para tipos de actividad
CREATE TYPE enum_tipo_actividad AS ENUM (
    'creacion',
    'edicion',
    'cambio_estado',
    'cambio_fechas',
    'cambio_responsable',
    'cambio_implementador',
    'cambio_producto',
    'cambio_tipo_investigacion',
    'cambio_periodo',
    'cambio_link_prueba',
    'cambio_link_resultados',
    'cambio_libreto',
    'cambio_descripcion',
    'eliminacion'
);

-- 2. Crear tabla de log de actividades
CREATE TABLE IF NOT EXISTS log_actividades_investigacion (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    investigacion_id UUID NOT NULL REFERENCES investigaciones(id) ON DELETE CASCADE,
    tipo_actividad enum_tipo_actividad NOT NULL,
    descripcion TEXT NOT NULL,
    cambios JSONB,
    usuario_id UUID REFERENCES auth.users(id),
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_log_actividades_investigacion_id ON log_actividades_investigacion(investigacion_id);
CREATE INDEX IF NOT EXISTS idx_log_actividades_fecha ON log_actividades_investigacion(fecha_creacion DESC);
CREATE INDEX IF NOT EXISTS idx_log_actividades_tipo ON log_actividades_investigacion(tipo_actividad);

-- 3. Función para registrar actividades
CREATE OR REPLACE FUNCTION registrar_actividad_investigacion(
    p_investigacion_id UUID,
    p_tipo_actividad enum_tipo_actividad,
    p_descripcion TEXT,
    p_cambios JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO log_actividades_investigacion (
        investigacion_id,
        tipo_actividad,
        descripcion,
        cambios,
        usuario_id
    ) VALUES (
        p_investigacion_id,
        p_tipo_actividad,
        p_descripcion,
        p_cambios,
        auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Función para detectar cambios en investigaciones
CREATE OR REPLACE FUNCTION trigger_log_cambios_investigacion()
RETURNS TRIGGER AS $$
DECLARE
    v_cambios JSONB := '{}'::JSONB;
    v_descripcion TEXT := '';
    v_tipo_actividad enum_tipo_actividad;
BEGIN
    -- Si es una inserción (nueva investigación)
    IF TG_OP = 'INSERT' THEN
        v_tipo_actividad := 'creacion';
        v_descripcion := 'Investigación creada: ' || NEW.nombre;
        v_cambios := jsonb_build_object(
            'nombre', NEW.nombre,
            'fecha_inicio', NEW.fecha_inicio,
            'fecha_fin', NEW.fecha_fin,
            'estado', NEW.estado
        );
        
        PERFORM registrar_actividad_investigacion(
            NEW.id,
            v_tipo_actividad,
            v_descripcion,
            v_cambios
        );
        
        RETURN NEW;
    END IF;
    
    -- Si es una eliminación
    IF TG_OP = 'DELETE' THEN
        v_tipo_actividad := 'eliminacion';
        v_descripcion := 'Investigación eliminada: ' || OLD.nombre;
        
        PERFORM registrar_actividad_investigacion(
            OLD.id,
            v_tipo_actividad,
            v_descripcion,
            jsonb_build_object('nombre', OLD.nombre)
        );
        
        RETURN OLD;
    END IF;
    
    -- Si es una actualización, detectar cambios específicos
    IF TG_OP = 'UPDATE' THEN
        v_cambios := '{}'::JSONB;
        
        -- Detectar cambios en nombre
        IF OLD.nombre IS DISTINCT FROM NEW.nombre THEN
            v_cambios := v_cambios || jsonb_build_object('nombre', jsonb_build_object('anterior', OLD.nombre, 'nuevo', NEW.nombre));
            v_descripcion := v_descripcion || 'Nombre cambiado de "' || OLD.nombre || '" a "' || NEW.nombre || '". ';
        END IF;
        
        -- Detectar cambios en estado
        IF OLD.estado IS DISTINCT FROM NEW.estado THEN
            v_cambios := v_cambios || jsonb_build_object('estado', jsonb_build_object('anterior', OLD.estado, 'nuevo', NEW.estado));
            v_descripcion := v_descripcion || 'Estado cambiado de ' || OLD.estado || ' a ' || NEW.estado || '. ';
            v_tipo_actividad := 'cambio_estado';
        END IF;
        
        -- Detectar cambios en fechas
        IF OLD.fecha_inicio IS DISTINCT FROM NEW.fecha_inicio OR OLD.fecha_fin IS DISTINCT FROM NEW.fecha_fin THEN
            v_cambios := v_cambios || jsonb_build_object(
                'fechas', jsonb_build_object(
                    'fecha_inicio_anterior', OLD.fecha_inicio,
                    'fecha_inicio_nueva', NEW.fecha_inicio,
                    'fecha_fin_anterior', OLD.fecha_fin,
                    'fecha_fin_nueva', NEW.fecha_fin
                )
            );
            v_descripcion := v_descripcion || 'Fechas actualizadas. ';
            v_tipo_actividad := 'cambio_fechas';
        END IF;
        
        -- Detectar cambios en responsable
        IF OLD.responsable_id IS DISTINCT FROM NEW.responsable_id THEN
            v_cambios := v_cambios || jsonb_build_object('responsable_id', jsonb_build_object('anterior', OLD.responsable_id, 'nuevo', NEW.responsable_id));
            v_descripcion := v_descripcion || 'Responsable cambiado. ';
            v_tipo_actividad := 'cambio_responsable';
        END IF;
        
        -- Detectar cambios en implementador
        IF OLD.implementador_id IS DISTINCT FROM NEW.implementador_id THEN
            v_cambios := v_cambios || jsonb_build_object('implementador_id', jsonb_build_object('anterior', OLD.implementador_id, 'nuevo', NEW.implementador_id));
            v_descripcion := v_descripcion || 'Implementador cambiado. ';
            v_tipo_actividad := 'cambio_implementador';
        END IF;
        
        -- Detectar cambios en producto
        IF OLD.producto_id IS DISTINCT FROM NEW.producto_id THEN
            v_cambios := v_cambios || jsonb_build_object('producto_id', jsonb_build_object('anterior', OLD.producto_id, 'nuevo', NEW.producto_id));
            v_descripcion := v_descripcion || 'Producto cambiado. ';
            v_tipo_actividad := 'cambio_producto';
        END IF;
        
        -- Detectar cambios en tipo de investigación
        IF OLD.tipo_investigacion_id IS DISTINCT FROM NEW.tipo_investigacion_id THEN
            v_cambios := v_cambios || jsonb_build_object('tipo_investigacion_id', jsonb_build_object('anterior', OLD.tipo_investigacion_id, 'nuevo', NEW.tipo_investigacion_id));
            v_descripcion := v_descripcion || 'Tipo de investigación cambiado. ';
            v_tipo_actividad := 'cambio_tipo_investigacion';
        END IF;
        
        -- Detectar cambios en período
        IF OLD.periodo_id IS DISTINCT FROM NEW.periodo_id THEN
            v_cambios := v_cambios || jsonb_build_object('periodo_id', jsonb_build_object('anterior', OLD.periodo_id, 'nuevo', NEW.periodo_id));
            v_descripcion := v_descripcion || 'Período cambiado. ';
            v_tipo_actividad := 'cambio_periodo';
        END IF;
        
        -- Detectar cambios en link de prueba
        IF OLD.link_prueba IS DISTINCT FROM NEW.link_prueba THEN
            v_cambios := v_cambios || jsonb_build_object('link_prueba', jsonb_build_object('anterior', OLD.link_prueba, 'nuevo', NEW.link_prueba));
            v_descripcion := v_descripcion || 'Link de prueba actualizado. ';
            v_tipo_actividad := 'cambio_link_prueba';
        END IF;
        
        -- Detectar cambios en link de resultados
        IF OLD.link_resultados IS DISTINCT FROM NEW.link_resultados THEN
            v_cambios := v_cambios || jsonb_build_object('link_resultados', jsonb_build_object('anterior', OLD.link_resultados, 'nuevo', NEW.link_resultados));
            v_descripcion := v_descripcion || 'Link de resultados actualizado. ';
            v_tipo_actividad := 'cambio_link_resultados';
        END IF;
        
        -- Detectar cambios en libreto
        IF OLD.libreto IS DISTINCT FROM NEW.libreto THEN
            v_cambios := v_cambios || jsonb_build_object('libreto', jsonb_build_object('anterior', OLD.libreto, 'nuevo', NEW.libreto));
            v_descripcion := v_descripcion || 'Libreto actualizado. ';
            v_tipo_actividad := 'cambio_libreto';
        END IF;
        
        -- Detectar cambios en descripción
        IF OLD.descripcion IS DISTINCT FROM NEW.descripcion THEN
            v_cambios := v_cambios || jsonb_build_object('descripcion', jsonb_build_object('anterior', OLD.descripcion, 'nuevo', NEW.descripcion));
            v_descripcion := v_descripcion || 'Descripción actualizada. ';
            v_tipo_actividad := 'cambio_descripcion';
        END IF;
        
        -- Si no se detectó un tipo específico, usar edición general
        IF v_tipo_actividad IS NULL THEN
            v_tipo_actividad := 'edicion';
            v_descripcion := 'Investigación editada: ' || NEW.nombre;
        END IF;
        
        -- Solo registrar si hay cambios
        IF v_cambios != '{}'::JSONB THEN
            PERFORM registrar_actividad_investigacion(
                NEW.id,
                v_tipo_actividad,
                v_descripcion,
                v_cambios
            );
        END IF;
        
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Crear trigger para investigaciones
DROP TRIGGER IF EXISTS trigger_log_actividades_investigacion ON investigaciones;
CREATE TRIGGER trigger_log_actividades_investigacion
    AFTER INSERT OR UPDATE OR DELETE ON investigaciones
    FOR EACH ROW
    EXECUTE FUNCTION trigger_log_cambios_investigacion();

-- 6. Configurar RLS (Row Level Security)
ALTER TABLE log_actividades_investigacion ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura de actividades de investigaciones que el usuario puede ver
CREATE POLICY "Usuarios pueden ver actividades de investigaciones accesibles" ON log_actividades_investigacion
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM investigaciones i
            WHERE i.id = log_actividades_investigacion.investigacion_id
            AND (
                i.creado_por = auth.uid() OR
                i.responsable_id = auth.uid() OR
                i.implementador_id = auth.uid()
            )
        )
    );

-- Política para permitir inserción de actividades
CREATE POLICY "Sistema puede insertar actividades" ON log_actividades_investigacion
    FOR INSERT WITH CHECK (true);

-- 7. Comentarios para documentación
COMMENT ON TABLE log_actividades_investigacion IS 'Registro de todas las actividades realizadas en investigaciones';
COMMENT ON COLUMN log_actividades_investigacion.tipo_actividad IS 'Tipo de actividad realizada';
COMMENT ON COLUMN log_actividades_investigacion.cambios IS 'Detalles de los cambios realizados en formato JSON';
COMMENT ON COLUMN log_actividades_investigacion.usuario_id IS 'ID del usuario que realizó la actividad';

-- 8. Función helper para obtener actividades de una investigación
CREATE OR REPLACE FUNCTION obtener_actividades_investigacion(p_investigacion_id UUID)
RETURNS TABLE (
    id UUID,
    tipo_actividad enum_tipo_actividad,
    descripcion TEXT,
    cambios JSONB,
    usuario_id UUID,
    fecha_creacion TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        la.id,
        la.tipo_actividad,
        la.descripcion,
        la.cambios,
        la.usuario_id,
        la.fecha_creacion
    FROM log_actividades_investigacion la
    WHERE la.investigacion_id = p_investigacion_id
    ORDER BY la.fecha_creacion DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FIN DEL SCRIPT
-- ===================================================== 