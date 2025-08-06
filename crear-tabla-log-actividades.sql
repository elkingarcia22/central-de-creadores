-- ====================================
-- CREAR TABLA LOG_ACTIVIDADES_INVESTIGACION
-- ====================================

-- 1. Crear enum para tipos de actividad
DO $$ BEGIN
    CREATE TYPE enum_tipo_actividad AS ENUM (
        'creacion',
        'edicion',
        'cambio_estado',
        'creacion_libreto',
        'edicion_libreto',
        'creacion_seguimiento',
        'edicion_seguimiento',
        'conversion_seguimiento',
        'eliminacion',
        'restauracion',
        'agregar_link_prueba',
        'editar_link_prueba',
        'eliminar_link_prueba',
        'agregar_link_resultados',
        'editar_link_resultados',
        'eliminar_link_resultados',
        'asignar_responsable',
        'cambiar_responsable',
        'asignar_implementador',
        'cambiar_implementador',
        'pausar_investigacion',
        'reanudar_investigacion',
        'cancelar_investigacion',
        'finalizar_investigacion',
        'duplicar_investigacion'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Crear tabla log_actividades_investigacion
CREATE TABLE IF NOT EXISTS log_actividades_investigacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigacion_id UUID NOT NULL,
    
    -- Información de la actividad
    tipo_actividad enum_tipo_actividad NOT NULL,
    descripcion TEXT NOT NULL,
    detalles JSONB DEFAULT '{}', -- Para almacenar información adicional
    
    -- Usuario que realizó la acción
    usuario_id UUID NOT NULL,
    usuario_nombre TEXT,
    usuario_email TEXT,
    
    -- Timestamp
    creado_el TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign keys
    CONSTRAINT fk_log_actividades_investigacion 
        FOREIGN KEY (investigacion_id) 
        REFERENCES investigaciones(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_log_actividades_usuario 
        FOREIGN KEY (usuario_id) 
        REFERENCES auth.users(id) 
        ON DELETE RESTRICT
);

-- 3. Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_log_actividades_investigacion_id 
    ON log_actividades_investigacion(investigacion_id);

CREATE INDEX IF NOT EXISTS idx_log_actividades_tipo 
    ON log_actividades_investigacion(tipo_actividad);

CREATE INDEX IF NOT EXISTS idx_log_actividades_usuario 
    ON log_actividades_investigacion(usuario_id);

CREATE INDEX IF NOT EXISTS idx_log_actividades_fecha 
    ON log_actividades_investigacion(creado_el);

-- 4. Habilitar RLS (Row Level Security)
ALTER TABLE log_actividades_investigacion ENABLE ROW LEVEL SECURITY;

-- 5. Crear políticas RLS
-- Política para permitir lectura a usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden ver log de actividades" ON log_actividades_investigacion
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política para permitir inserción a usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden crear log de actividades" ON log_actividades_investigacion
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 6. Crear función para registrar actividades automáticamente
CREATE OR REPLACE FUNCTION registrar_actividad_investigacion(
    p_investigacion_id UUID,
    p_tipo_actividad enum_tipo_actividad,
    p_descripcion TEXT,
    p_detalles JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    v_usuario_id UUID;
    v_usuario_nombre TEXT;
    v_usuario_email TEXT;
    v_log_id UUID;
BEGIN
    -- Obtener información del usuario actual
    SELECT 
        auth.uid(),
        profiles.nombre,
        profiles.email
    INTO 
        v_usuario_id,
        v_usuario_nombre,
        v_usuario_email
    FROM profiles 
    WHERE profiles.id = auth.uid();
    
    -- Si no se encuentra el usuario, usar valores por defecto
    IF v_usuario_id IS NULL THEN
        v_usuario_id := auth.uid();
        v_usuario_nombre := 'Usuario del sistema';
        v_usuario_email := 'sistema@central-creadores.com';
    END IF;
    
    -- Insertar el registro de actividad
    INSERT INTO log_actividades_investigacion (
        investigacion_id,
        tipo_actividad,
        descripcion,
        detalles,
        usuario_id,
        usuario_nombre,
        usuario_email
    ) VALUES (
        p_investigacion_id,
        p_tipo_actividad,
        p_descripcion,
        p_detalles,
        v_usuario_id,
        v_usuario_nombre,
        v_usuario_email
    ) RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Crear triggers para registrar actividades automáticamente

-- Trigger para creación de investigación
CREATE OR REPLACE FUNCTION trigger_log_creacion_investigacion()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM registrar_actividad_investigacion(
        NEW.id,
        'creacion',
        'Investigación creada: ' || NEW.nombre,
        jsonb_build_object(
            'nombre', NEW.nombre,
            'estado', NEW.estado,
            'fecha_inicio', NEW.fecha_inicio,
            'fecha_fin', NEW.fecha_fin
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_creacion_investigacion
    AFTER INSERT ON investigaciones
    FOR EACH ROW
    EXECUTE FUNCTION trigger_log_creacion_investigacion();

-- Trigger para edición de investigación
CREATE OR REPLACE FUNCTION trigger_log_edicion_investigacion()
RETURNS TRIGGER AS $$
DECLARE
    v_cambios JSONB := '{}';
    v_descripcion TEXT := 'Investigación actualizada';
BEGIN
    -- Detectar cambios específicos
    IF OLD.nombre IS DISTINCT FROM NEW.nombre THEN
        v_cambios := v_cambios || jsonb_build_object('nombre_anterior', OLD.nombre, 'nombre_nuevo', NEW.nombre);
        v_descripcion := v_descripcion || ' - Nombre cambiado';
    END IF;
    
    IF OLD.estado IS DISTINCT FROM NEW.estado THEN
        v_cambios := v_cambios || jsonb_build_object('estado_anterior', OLD.estado, 'estado_nuevo', NEW.estado);
        v_descripcion := v_descripcion || ' - Estado cambiado de ' || OLD.estado || ' a ' || NEW.estado;
    END IF;
    
    IF OLD.fecha_inicio IS DISTINCT FROM NEW.fecha_inicio THEN
        v_cambios := v_cambios || jsonb_build_object('fecha_inicio_anterior', OLD.fecha_inicio, 'fecha_inicio_nueva', NEW.fecha_inicio);
        v_descripcion := v_descripcion || ' - Fecha de inicio actualizada';
    END IF;
    
    IF OLD.fecha_fin IS DISTINCT FROM NEW.fecha_fin THEN
        v_cambios := v_cambios || jsonb_build_object('fecha_fin_anterior', OLD.fecha_fin, 'fecha_fin_nueva', NEW.fecha_fin);
        v_descripcion := v_descripcion || ' - Fecha de fin actualizada';
    END IF;
    
    IF OLD.responsable_id IS DISTINCT FROM NEW.responsable_id THEN
        v_cambios := v_cambios || jsonb_build_object('responsable_anterior', OLD.responsable_id, 'responsable_nuevo', NEW.responsable_id);
        v_descripcion := v_descripcion || ' - Responsable cambiado';
    END IF;
    
    IF OLD.implementador_id IS DISTINCT FROM NEW.implementador_id THEN
        v_cambios := v_cambios || jsonb_build_object('implementador_anterior', OLD.implementador_id, 'implementador_nuevo', NEW.implementador_id);
        v_descripcion := v_descripcion || ' - Implementador cambiado';
    END IF;
    
    -- Solo registrar si hay cambios
    IF v_cambios != '{}' THEN
        PERFORM registrar_actividad_investigacion(
            NEW.id,
            'edicion',
            v_descripcion,
            v_cambios
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_edicion_investigacion
    AFTER UPDATE ON investigaciones
    FOR EACH ROW
    EXECUTE FUNCTION trigger_log_edicion_investigacion();

-- Trigger para eliminación de investigación
CREATE OR REPLACE FUNCTION trigger_log_eliminacion_investigacion()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM registrar_actividad_investigacion(
        OLD.id,
        'eliminacion',
        'Investigación eliminada: ' || OLD.nombre,
        jsonb_build_object(
            'nombre', OLD.nombre,
            'estado', OLD.estado,
            'fecha_inicio', OLD.fecha_inicio,
            'fecha_fin', OLD.fecha_fin
        )
    );
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_eliminacion_investigacion
    BEFORE DELETE ON investigaciones
    FOR EACH ROW
    EXECUTE FUNCTION trigger_log_eliminacion_investigacion();

-- 8. Crear función para obtener log de actividades
CREATE OR REPLACE FUNCTION obtener_log_actividades_investigacion(p_investigacion_id UUID)
RETURNS TABLE (
    id UUID,
    tipo_actividad enum_tipo_actividad,
    descripcion TEXT,
    detalles JSONB,
    usuario_nombre TEXT,
    usuario_email TEXT,
    creado_el TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        la.id,
        la.tipo_actividad,
        la.descripcion,
        la.detalles,
        la.usuario_nombre,
        la.usuario_email,
        la.creado_el
    FROM log_actividades_investigacion la
    WHERE la.investigacion_id = p_investigacion_id
    ORDER BY la.creado_el DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Comentarios para documentación
COMMENT ON TABLE log_actividades_investigacion IS 'Registro de todas las actividades realizadas en las investigaciones';
COMMENT ON COLUMN log_actividades_investigacion.tipo_actividad IS 'Tipo de actividad realizada';
COMMENT ON COLUMN log_actividades_investigacion.descripcion IS 'Descripción legible de la actividad';
COMMENT ON COLUMN log_actividades_investigacion.detalles IS 'Información adicional en formato JSON';
COMMENT ON COLUMN log_actividades_investigacion.usuario_id IS 'ID del usuario que realizó la actividad';
COMMENT ON COLUMN log_actividades_investigacion.usuario_nombre IS 'Nombre del usuario que realizó la actividad';
COMMENT ON COLUMN log_actividades_investigacion.usuario_email IS 'Email del usuario que realizó la actividad';

-- 10. Mensaje de confirmación
SELECT 'Tabla log_actividades_investigacion creada exitosamente con triggers automáticos' as resultado; 