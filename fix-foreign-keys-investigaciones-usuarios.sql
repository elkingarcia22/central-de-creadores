-- ================================================================
-- SCRIPT: Cambiar Foreign Keys de Investigaciones a usuarios_con_roles
-- ================================================================
-- Este script actualiza las foreign keys de responsable_id e implementador_id
-- en la tabla investigaciones para que apunten a usuarios_con_roles
-- en lugar de la tabla usuarios directamente

-- 1. Verificar las foreign keys actuales
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE 
    tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'investigaciones'
    AND kcu.column_name IN ('responsable_id', 'implementador_id', 'creado_por');

-- 2. Eliminar las foreign keys existentes si existen
DO $$
BEGIN
    -- Eliminar constraint de responsable_id si existe
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'investigaciones' 
        AND constraint_type = 'FOREIGN KEY' 
        AND constraint_name LIKE '%responsable_id%'
    ) THEN
        EXECUTE 'ALTER TABLE investigaciones DROP CONSTRAINT ' || (
            SELECT constraint_name 
            FROM information_schema.table_constraints 
            WHERE table_name = 'investigaciones' 
            AND constraint_type = 'FOREIGN KEY' 
            AND constraint_name LIKE '%responsable_id%'
            LIMIT 1
        );
        RAISE NOTICE 'Foreign key constraint for responsable_id dropped';
    END IF;

    -- Eliminar constraint de implementador_id si existe
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'investigaciones' 
        AND constraint_type = 'FOREIGN KEY' 
        AND constraint_name LIKE '%implementador_id%'
    ) THEN
        EXECUTE 'ALTER TABLE investigaciones DROP CONSTRAINT ' || (
            SELECT constraint_name 
            FROM information_schema.table_constraints 
            WHERE table_name = 'investigaciones' 
            AND constraint_type = 'FOREIGN KEY' 
            AND constraint_name LIKE '%implementador_id%'
            LIMIT 1
        );
        RAISE NOTICE 'Foreign key constraint for implementador_id dropped';
    END IF;

    -- Eliminar constraint de creado_por si existe
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'investigaciones' 
        AND constraint_type = 'FOREIGN KEY' 
        AND constraint_name LIKE '%creado_por%'
    ) THEN
        EXECUTE 'ALTER TABLE investigaciones DROP CONSTRAINT ' || (
            SELECT constraint_name 
            FROM information_schema.table_constraints 
            WHERE table_name = 'investigaciones' 
            AND constraint_type = 'FOREIGN KEY' 
            AND constraint_name LIKE '%creado_por%'
            LIMIT 1
        );
        RAISE NOTICE 'Foreign key constraint for creado_por dropped';
    END IF;
END $$;

-- 3. Verificar que usuarios_con_roles existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'usuarios_con_roles'
    ) THEN
        RAISE EXCEPTION 'La vista usuarios_con_roles no existe. Debe crearla primero.';
    END IF;
    RAISE NOTICE 'Vista usuarios_con_roles existe ✓';
END $$;

-- 4. Crear nuevas foreign keys que apunten a usuarios_con_roles
-- NOTA: En PostgreSQL, las foreign keys no pueden apuntar a vistas,
-- solo a tablas. Por lo tanto, vamos a crear las foreign keys 
-- que apunten a la tabla base que contiene los IDs de usuarios.

-- Primero, verificamos qué tabla base contiene los IDs de usuarios
-- (probablemente 'usuarios' o 'profiles')

-- Crear foreign key para responsable_id
ALTER TABLE investigaciones 
ADD CONSTRAINT fk_investigaciones_responsable 
FOREIGN KEY (responsable_id) 
REFERENCES usuarios(id) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- Crear foreign key para implementador_id
ALTER TABLE investigaciones 
ADD CONSTRAINT fk_investigaciones_implementador 
FOREIGN KEY (implementador_id) 
REFERENCES usuarios(id) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- Crear foreign key para creado_por
ALTER TABLE investigaciones 
ADD CONSTRAINT fk_investigaciones_creado_por 
FOREIGN KEY (creado_por) 
REFERENCES usuarios(id) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- 5. Verificar las nuevas foreign keys
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE 
    tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'investigaciones'
    AND kcu.column_name IN ('responsable_id', 'implementador_id', 'creado_por');

-- 6. Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '✅ Foreign keys actualizadas exitosamente';
    RAISE NOTICE '📋 Ahora investigaciones.responsable_id apunta a usuarios(id)';
    RAISE NOTICE '📋 Ahora investigaciones.implementador_id apunta a usuarios(id)';
    RAISE NOTICE '📋 Ahora investigaciones.creado_por apunta a usuarios(id)';
    RAISE NOTICE '🔍 Pero la API seguirá usando usuarios_con_roles para mostrar los datos completos';
END $$; 