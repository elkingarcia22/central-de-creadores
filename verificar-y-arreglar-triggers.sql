-- Script para verificar y arreglar triggers de actividades
-- Ejecuta esto en el SQL Editor de Supabase

-- 1. Verificar si los triggers existen
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND event_object_table IN ('investigaciones', 'libretos_investigacion', 'seguimientos_investigacion')
ORDER BY event_object_table, trigger_name;

-- 2. Verificar si las funciones de trigger existen
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name IN (
    'trigger_log_cambios_investigacion',
    'trigger_creacion_libreto',
    'trigger_edicion_libreto',
    'trigger_creacion_seguimiento',
    'trigger_edicion_seguimiento'
);

-- 3. Verificar si hay datos en la tabla de actividades
SELECT COUNT(*) as total_actividades FROM log_actividades_investigacion;

-- 4. Crear función para log de cambios en investigaciones (si no existe)
CREATE OR REPLACE FUNCTION trigger_log_cambios_investigacion()
RETURNS TRIGGER AS $$
DECLARE
    descripcion_actividad TEXT;
    tipo_actividad_valor TEXT;
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

-- 5. Crear función para log de libretos (si no existe)
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
        'cambio_libreto',
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
        'cambio_libreto',
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

-- 6. Crear función para log de seguimientos (si no existe)
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
        'cambio_estado',
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
        'cambio_estado',
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

-- 7. Crear o reemplazar triggers
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

-- 8. Verificar que todo esté funcionando
SELECT 'Triggers creados exitosamente' as resultado; 