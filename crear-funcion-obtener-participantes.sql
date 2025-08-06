-- ====================================
-- CREAR FUNCIÓN RPC PARA OBTENER PARTICIPANTES
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- Crear función para obtener detalles de participantes
CREATE OR REPLACE FUNCTION obtener_participantes_detalle(participantes_ids uuid[])
RETURNS TABLE (
    id uuid,
    nombre text,
    "descripción" text,
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