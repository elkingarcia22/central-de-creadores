-- ================================================
-- CREAR ENUM PARA ESTADOS DE INVESTIGACIÓN
-- ================================================

-- 1. Crear el enum estado_investigacion si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_investigacion') THEN
        CREATE TYPE estado_investigacion AS ENUM (
            'borrador',
            'por_iniciar', 
            'en_progreso',
            'finalizado',
            'pausado',
            'deprecado',
            'por_agendar'
        );
        RAISE NOTICE 'Enum estado_investigacion creado exitosamente';
    ELSE
        RAISE NOTICE 'Enum estado_investigacion ya existe';
    END IF;
END $$;

-- 2. Crear función para obtener valores de cualquier enum
CREATE OR REPLACE FUNCTION get_enum_values(enum_name text)
RETURNS text[]
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    enum_values text[];
BEGIN
    -- Obtener los valores del enum especificado
    SELECT array_agg(enumlabel ORDER BY enumsortorder)
    INTO enum_values
    FROM pg_enum
    JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
    WHERE pg_type.typname = enum_name;
    
    -- Si no se encontraron valores, devolver array vacío
    IF enum_values IS NULL THEN
        enum_values := ARRAY[]::text[];
    END IF;
    
    RETURN enum_values;
END;
$$;

-- 3. Dar permisos para que la función sea accesible públicamente
GRANT EXECUTE ON FUNCTION get_enum_values(text) TO public;

-- 4. Verificar que todo funciona correctamente
SELECT get_enum_values('estado_investigacion') as estados_disponibles;
