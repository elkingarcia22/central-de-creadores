-- Script para corregir el conflicto de tipos en tipo_actividad
-- Ejecuta esto en el SQL Editor de Supabase

-- 1. Verificar la estructura actual de las tablas
SELECT 
    table_name,
    column_name,
    data_type,
    udt_name
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND column_name = 'tipo_actividad'
ORDER BY table_name;

-- 2. Verificar los valores del enum
SELECT unnest(enum_range(NULL::enum_tipo_actividad)) as valores_enum;

-- 3. Corregir la función del trigger para usar el enum correcto
CREATE OR REPLACE FUNCTION trigger_log_cambios_investigacion()
RETURNS TRIGGER AS $$
DECLARE
    descripcion_actividad TEXT;
    tipo_actividad_valor enum_tipo_actividad;
    cambios_json JSONB;
BEGIN
    -- Determinar el tipo de actividad y descripción
    IF TG_OP = 'INSERT' THEN
        tipo_actividad_valor := 'creacion';
        descripcion_actividad := 'Investigación creada';
        cambios_json := to_jsonb(NEW);
    ELSIF TG_OP = 'UPDATE' THEN
        tipo_actividad_valor := 'edicion';
        descripcion_actividad := 'Investigación actualizada';
        cambios_json := jsonb_build_object(
            'valores_anteriores', to_jsonb(OLD),
            'valores_nuevos', to_jsonb(NEW)
        );
    ELSIF TG_OP = 'DELETE' THEN
        tipo_actividad_valor := 'eliminacion';
        descripcion_actividad := 'Investigación eliminada';
        cambios_json := to_jsonb(OLD);
    END IF;

    -- Insertar registro de actividad
    INSERT INTO log_actividades_investigacion (
        investigacion_id,
        tipo_actividad,
        descripcion,
        cambios,
        usuario_id,
        fecha_creacion
    ) VALUES (
        COALESCE(NEW.id, OLD.id),
        tipo_actividad_valor,
        descripcion_actividad,
        cambios_json,
        COALESCE(NEW.creado_por, OLD.creado_por),
        NOW()
    );

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 4. Corregir las funciones de libretos
CREATE OR REPLACE FUNCTION trigger_creacion_libreto()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO log_actividades_investigacion (
        investigacion_id,
        tipo_actividad,
        descripcion,
        cambios,
        usuario_id,
        fecha_creacion
    ) VALUES (
        NEW.investigacion_id,
        'cambio_libreto'::enum_tipo_actividad,
        'Libreto creado',
        to_jsonb(NEW),
        NEW.creado_por,
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trigger_edicion_libreto()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO log_actividades_investigacion (
        investigacion_id,
        tipo_actividad,
        descripcion,
        cambios,
        usuario_id,
        fecha_creacion
    ) VALUES (
        NEW.investigacion_id,
        'cambio_libreto'::enum_tipo_actividad,
        'Libreto actualizado',
        jsonb_build_object(
            'valores_anteriores', to_jsonb(OLD),
            'valores_nuevos', to_jsonb(NEW)
        ),
        NEW.creado_por,
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Corregir las funciones de seguimientos
CREATE OR REPLACE FUNCTION trigger_creacion_seguimiento()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO log_actividades_investigacion (
        investigacion_id,
        tipo_actividad,
        descripcion,
        cambios,
        usuario_id,
        fecha_creacion
    ) VALUES (
        NEW.investigacion_id,
        'cambio_estado'::enum_tipo_actividad,
        'Seguimiento creado',
        to_jsonb(NEW),
        NEW.creado_por,
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trigger_edicion_seguimiento()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO log_actividades_investigacion (
        investigacion_id,
        tipo_actividad,
        descripcion,
        cambios,
        usuario_id,
        fecha_creacion
    ) VALUES (
        NEW.investigacion_id,
        'cambio_estado'::enum_tipo_actividad,
        'Seguimiento actualizado',
        jsonb_build_object(
            'valores_anteriores', to_jsonb(OLD),
            'valores_nuevos', to_jsonb(NEW)
        ),
        NEW.creado_por,
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Recrear los triggers
DROP TRIGGER IF EXISTS trigger_log_actividades_investigacion ON investigaciones;
CREATE TRIGGER trigger_log_actividades_investigacion
    AFTER INSERT OR UPDATE OR DELETE ON investigaciones
    FOR EACH ROW EXECUTE FUNCTION trigger_log_cambios_investigacion();

DROP TRIGGER IF EXISTS trigger_creacion_libreto ON libretos_investigacion;
CREATE TRIGGER trigger_creacion_libreto
    AFTER INSERT ON libretos_investigacion
    FOR EACH ROW EXECUTE FUNCTION trigger_creacion_libreto();

DROP TRIGGER IF EXISTS trigger_edicion_libreto ON libretos_investigacion;
CREATE TRIGGER trigger_edicion_libreto
    AFTER UPDATE ON libretos_investigacion
    FOR EACH ROW EXECUTE FUNCTION trigger_edicion_libreto();

DROP TRIGGER IF EXISTS trigger_creacion_seguimiento ON seguimientos_investigacion;
CREATE TRIGGER trigger_creacion_seguimiento
    AFTER INSERT ON seguimientos_investigacion
    FOR EACH ROW EXECUTE FUNCTION trigger_creacion_seguimiento();

DROP TRIGGER IF EXISTS trigger_edicion_seguimiento ON seguimientos_investigacion;
CREATE TRIGGER trigger_edicion_seguimiento
    AFTER UPDATE ON seguimientos_investigacion
    FOR EACH ROW EXECUTE FUNCTION trigger_edicion_seguimiento();

-- 7. Verificar que todo esté funcionando
SELECT 'Triggers corregidos exitosamente' as resultado; 