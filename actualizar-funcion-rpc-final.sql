-- ====================================
-- ACTUALIZAR FUNCIÓN RPC FINAL
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- Eliminar la función existente primero
DROP FUNCTION IF EXISTS obtener_participantes_basicos(uuid[]);

-- Crear la función RPC para manejar tipos correctos
CREATE OR REPLACE FUNCTION obtener_participantes_basicos(participantes_ids uuid[])
RETURNS TABLE (
    id uuid,
    nombre text,
    descripcion text,
    doleres_necesidades text,
    rol_empresa_id uuid,
    kam_id uuid,
    empresa_id uuid,
    total_participaciones integer,
    productos_relacionados text,
    estado_participante text
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
        p.productos_relacionados::text,
        p.estado_participante::text
    FROM participantes p
    WHERE p.id = ANY(participantes_ids);
END;
$$ LANGUAGE plpgsql;

-- Probar la función actualizada
SELECT * FROM obtener_participantes_basicos(ARRAY['bdcf99c2-4022-44b8-8c16-2e115b6c1245']::uuid[]);

-- Verificar que la función existe
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name = 'obtener_participantes_basicos'; 