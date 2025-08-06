-- ====================================
-- CREAR FUNCIÓN RPC CORREGIDA
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- Eliminar funciones anteriores si existen
DROP FUNCTION IF EXISTS obtener_participantes_detalle(uuid[]);
DROP FUNCTION IF EXISTS obtener_participantes_detalle_simple(uuid[]);

-- Crear función RPC corregida
CREATE OR REPLACE FUNCTION obtener_participantes_detalle_corregida(participantes_ids uuid[])
RETURNS TABLE (
    id uuid,
    nombre text,
    descripcion text,
    doleres_necesidades text,
    rol_empresa_id uuid,
    kam_id uuid,
    empresa_id uuid,
    total_participaciones integer,
    fecha_ultima_participacion timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    creado_por uuid,
    productos_relacionados text,
    estado_participante boolean
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.nombre,
        p."descripción",
        p.doleres_necesidades,
        p.rol_empresa_id,
        p.kam_id,
        p.empresa_id,
        p.total_participaciones,
        p.fecha_ultima_participacion,
        p.created_at,
        p.updated_at,
        p.creado_por,
        p.productos_relacionados,
        p.estado_participante
    FROM participantes p
    WHERE p.id = ANY(participantes_ids);
END;
$$ LANGUAGE plpgsql;

-- Probar la función
SELECT * FROM obtener_participantes_detalle_corregida(ARRAY['bdcf99c2-4022-44b8-8c16-2e115b6c1245']::uuid[]);

-- Verificar que la función existe
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name = 'obtener_participantes_detalle_corregida'; 