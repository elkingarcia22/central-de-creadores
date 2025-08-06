-- Script para agregar el estado "por_agendar" al enum de estados de investigación
-- Ejecutar solo si el estado no existe ya

-- Verificar si el estado "por_agendar" ya existe en el enum
DO $$
BEGIN
    -- Verificar si el valor 'por_agendar' ya existe en el enum
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_enum 
        WHERE enumlabel = 'por_agendar' 
        AND enumtypid = (
            SELECT oid 
            FROM pg_type 
            WHERE typname = 'enum_estado_investigacion'
        )
    ) THEN
        -- Agregar el nuevo valor al enum
        ALTER TYPE enum_estado_investigacion ADD VALUE 'por_agendar' AFTER 'en_borrador';
        RAISE NOTICE 'Estado "por_agendar" agregado exitosamente al enum';
    ELSE
        RAISE NOTICE 'El estado "por_agendar" ya existe en el enum';
    END IF;
END $$;

-- Verificar los valores actuales del enum
SELECT enumlabel as estado
FROM pg_enum 
WHERE enumtypid = (
    SELECT oid 
    FROM pg_type 
    WHERE typname = 'enum_estado_investigacion'
)
ORDER BY enumsortorder; 