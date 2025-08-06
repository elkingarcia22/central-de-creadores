-- ====================================
-- PROBAR FUNCIÓN RPC SIMPLE
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- Verificar si la función existe
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name = 'obtener_participantes_detalle';

-- Probar la función con un participante
SELECT * FROM obtener_participantes_detalle(ARRAY['bdcf99c2-4022-44b8-8c16-2e115b6c1245']::uuid[]);

-- Si la función no existe, crear una versión simple
CREATE OR REPLACE FUNCTION obtener_participantes_detalle_simple(participantes_ids uuid[])
RETURNS TABLE (
    id uuid,
    nombre text,
    descripcion text,
    doleres_necesidades text,
    rol_empresa_id uuid,
    kam_id uuid,
    empresa_id uuid,
    total_participaciones integer
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
        p.total_participaciones
    FROM participantes p
    WHERE p.id = ANY(participantes_ids);
END;
$$ LANGUAGE plpgsql;

-- Probar la función simple
SELECT * FROM obtener_participantes_detalle_simple(ARRAY['bdcf99c2-4022-44b8-8c16-2e115b6c1245']::uuid[]); 