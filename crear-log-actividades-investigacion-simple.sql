-- ====================================
-- SISTEMA DE LOG DE ACTIVIDADES DE INVESTIGACIONES (VERSIÓN SIMPLIFICADA)
-- ====================================

-- 1. Crear el enum para tipos de actividad
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

-- 2. Crear la tabla de log de actividades
CREATE TABLE log_actividades_investigacion (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  investigacion_id UUID NOT NULL REFERENCES investigaciones(id) ON DELETE CASCADE,
  tipo_actividad enum_tipo_actividad NOT NULL,
  descripcion TEXT NOT NULL,
  detalles JSONB DEFAULT '{}',
  usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  usuario_nombre TEXT,
  usuario_email TEXT,
  creado_el TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Crear índices para optimizar consultas
CREATE INDEX idx_log_actividades_investigacion_id ON log_actividades_investigacion(investigacion_id);
CREATE INDEX idx_log_actividades_tipo ON log_actividades_investigacion(tipo_actividad);
CREATE INDEX idx_log_actividades_fecha ON log_actividades_investigacion(creado_el DESC);
CREATE INDEX idx_log_actividades_usuario ON log_actividades_investigacion(usuario_id);

-- 4. Función para registrar actividades automáticamente
CREATE OR REPLACE FUNCTION registrar_actividad_investigacion(
  p_investigacion_id UUID,
  p_tipo_actividad enum_tipo_actividad,
  p_descripcion TEXT,
  p_detalles JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_usuario_id UUID;
  v_usuario_nombre TEXT;
  v_usuario_email TEXT;
  v_actividad_id UUID;
BEGIN
  -- Obtener información del usuario actual
  SELECT 
    auth.uid(),
    profiles.full_name,
    profiles.email
  INTO 
    v_usuario_id,
    v_usuario_nombre,
    v_usuario_email
  FROM profiles 
  WHERE profiles.id = auth.uid();
  
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
    COALESCE(v_usuario_nombre, 'Usuario desconocido'),
    COALESCE(v_usuario_email, 'sin-email@ejemplo.com')
  ) RETURNING id INTO v_actividad_id;
  
  RETURN v_actividad_id;
END;
$$;

-- 5. Función para obtener estadísticas del log
CREATE OR REPLACE FUNCTION obtener_estadisticas_log_actividades(p_investigacion_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_resultado JSON;
BEGIN
  SELECT json_build_object(
    'total_actividades', COUNT(*),
    'ultima_actividad', MAX(creado_el),
    'actividades_por_tipo', json_object_agg(tipo_actividad, COUNT(*)),
    'usuarios_activos', json_agg(DISTINCT usuario_nombre)
  ) INTO v_resultado
  FROM log_actividades_investigacion
  WHERE investigacion_id = p_investigacion_id;
  
  RETURN v_resultado;
END;
$$;

-- 6. Triggers para registrar actividades automáticamente

-- Trigger para creación de investigación
CREATE OR REPLACE FUNCTION trigger_creacion_investigacion()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM registrar_actividad_investigacion(
    NEW.id,
    'creacion',
    'Investigación creada: ' || NEW.nombre,
    json_build_object(
      'nombre', NEW.nombre,
      'estado', NEW.estado,
      'responsable_id', NEW.responsable_id
    )
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_creacion_investigacion
  AFTER INSERT ON investigaciones
  FOR EACH ROW
  EXECUTE FUNCTION trigger_creacion_investigacion();

-- Trigger para edición de investigación
CREATE OR REPLACE FUNCTION trigger_edicion_investigacion()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_cambios TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Detectar cambios en campos importantes
  IF OLD.nombre IS DISTINCT FROM NEW.nombre THEN
    v_cambios := array_append(v_cambios, 'nombre');
  END IF;
  
  IF OLD.descripcion IS DISTINCT FROM NEW.descripcion THEN
    v_cambios := array_append(v_cambios, 'descripción');
  END IF;
  
  IF OLD.objetivo IS DISTINCT FROM NEW.objetivo THEN
    v_cambios := array_append(v_cambios, 'objetivo');
  END IF;
  
  IF OLD.estado IS DISTINCT FROM NEW.estado THEN
    PERFORM registrar_actividad_investigacion(
      NEW.id,
      'cambio_estado',
      'Estado cambiado de ' || COALESCE(OLD.estado, 'sin estado') || ' a ' || COALESCE(NEW.estado, 'sin estado'),
      json_build_object(
        'estado_anterior', OLD.estado,
        'estado_nuevo', NEW.estado
      )
    );
  END IF;
  
  IF OLD.responsable_id IS DISTINCT FROM NEW.responsable_id THEN
    PERFORM registrar_actividad_investigacion(
      NEW.id,
      'cambiar_responsable',
      'Responsable cambiado',
      json_build_object(
        'responsable_anterior', OLD.responsable_id,
        'responsable_nuevo', NEW.responsable_id
      )
    );
  END IF;
  
  IF OLD.implementador_id IS DISTINCT FROM NEW.implementador_id THEN
    PERFORM registrar_actividad_investigacion(
      NEW.id,
      'cambiar_implementador',
      'Implementador cambiado',
      json_build_object(
        'implementador_anterior', OLD.implementador_id,
        'implementador_nuevo', NEW.implementador_id
      )
    );
  END IF;
  
  -- Si hay otros cambios, registrar como edición general
  IF array_length(v_cambios, 1) > 0 THEN
    PERFORM registrar_actividad_investigacion(
      NEW.id,
      'edicion',
      'Investigación editada: ' || array_to_string(v_cambios, ', '),
      json_build_object('campos_modificados', v_cambios)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_edicion_investigacion
  AFTER UPDATE ON investigaciones
  FOR EACH ROW
  EXECUTE FUNCTION trigger_edicion_investigacion();

-- Trigger para eliminación de investigación
CREATE OR REPLACE FUNCTION trigger_eliminacion_investigacion()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM registrar_actividad_investigacion(
    OLD.id,
    'eliminacion',
    'Investigación eliminada: ' || OLD.nombre,
    json_build_object(
      'nombre', OLD.nombre,
      'estado', OLD.estado
    )
  );
  RETURN OLD;
END;
$$;

CREATE TRIGGER trigger_eliminacion_investigacion
  BEFORE DELETE ON investigaciones
  FOR EACH ROW
  EXECUTE FUNCTION trigger_eliminacion_investigacion();

-- Trigger para cambios en links de prueba
CREATE OR REPLACE FUNCTION trigger_cambio_link_prueba()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.link_prueba IS NULL AND NEW.link_prueba IS NOT NULL THEN
    PERFORM registrar_actividad_investigacion(
      NEW.id,
      'agregar_link_prueba',
      'Link de prueba agregado',
      json_build_object('link', NEW.link_prueba)
    );
  ELSIF OLD.link_prueba IS NOT NULL AND NEW.link_prueba IS NULL THEN
    PERFORM registrar_actividad_investigacion(
      NEW.id,
      'eliminar_link_prueba',
      'Link de prueba eliminado',
      json_build_object('link_anterior', OLD.link_prueba)
    );
  ELSIF OLD.link_prueba IS DISTINCT FROM NEW.link_prueba THEN
    PERFORM registrar_actividad_investigacion(
      NEW.id,
      'editar_link_prueba',
      'Link de prueba actualizado',
      json_build_object(
        'link_anterior', OLD.link_prueba,
        'link_nuevo', NEW.link_prueba
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_cambio_link_prueba
  AFTER UPDATE ON investigaciones
  FOR EACH ROW
  EXECUTE FUNCTION trigger_cambio_link_prueba();

-- Trigger para cambios en links de resultados
CREATE OR REPLACE FUNCTION trigger_cambio_link_resultados()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.link_resultados IS NULL AND NEW.link_resultados IS NOT NULL THEN
    PERFORM registrar_actividad_investigacion(
      NEW.id,
      'agregar_link_resultados',
      'Link de resultados agregado',
      json_build_object('link', NEW.link_resultados)
    );
  ELSIF OLD.link_resultados IS NOT NULL AND NEW.link_resultados IS NULL THEN
    PERFORM registrar_actividad_investigacion(
      NEW.id,
      'eliminar_link_resultados',
      'Link de resultados eliminado',
      json_build_object('link_anterior', OLD.link_resultados)
    );
  ELSIF OLD.link_resultados IS DISTINCT FROM NEW.link_resultados THEN
    PERFORM registrar_actividad_investigacion(
      NEW.id,
      'editar_link_resultados',
      'Link de resultados actualizado',
      json_build_object(
        'link_anterior', OLD.link_resultados,
        'link_nuevo', NEW.link_resultados
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_cambio_link_resultados
  AFTER UPDATE ON investigaciones
  FOR EACH ROW
  EXECUTE FUNCTION trigger_cambio_link_resultados();

-- 7. Políticas RLS para la tabla de log
ALTER TABLE log_actividades_investigacion ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura a usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden leer log de actividades" ON log_actividades_investigacion
  FOR SELECT
  TO authenticated
  USING (true);

-- Política para permitir inserción solo a través de la función
CREATE POLICY "Solo función puede insertar en log de actividades" ON log_actividades_investigacion
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 8. Comentarios para documentación
COMMENT ON TABLE log_actividades_investigacion IS 'Registro de todas las actividades realizadas en investigaciones';
COMMENT ON COLUMN log_actividades_investigacion.tipo_actividad IS 'Tipo de actividad realizada';
COMMENT ON COLUMN log_actividades_investigacion.descripcion IS 'Descripción legible de la actividad';
COMMENT ON COLUMN log_actividades_investigacion.detalles IS 'Detalles adicionales en formato JSON';
COMMENT ON COLUMN log_actividades_investigacion.usuario_nombre IS 'Nombre del usuario que realizó la actividad';

-- ====================================
-- FIN DEL SCRIPT SIMPLIFICADO
-- ==================================== 