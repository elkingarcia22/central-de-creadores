-- ================================================================
-- SCRIPT: Cambiar Foreign Keys de investigaciones a profiles
-- ================================================================
-- Este script actualiza las foreign keys de responsable_id, implementador_id
-- y creado_por en la tabla investigaciones para que apunten a profiles
-- en lugar de usuarios, ya que usuarios_con_roles está basada en profiles

-- 1. Verificar las foreign keys actuales
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

-- 2. Eliminar las foreign keys existentes
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    -- Buscar y eliminar todas las foreign keys relacionadas con usuarios
    FOR constraint_record IN 
        SELECT tc.constraint_name
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' 
          AND tc.table_name = 'investigaciones'
          AND kcu.column_name IN ('responsable_id', 'implementador_id', 'creado_por')
    LOOP
        EXECUTE 'ALTER TABLE investigaciones DROP CONSTRAINT ' || constraint_record.constraint_name;
        RAISE NOTICE 'Eliminada foreign key: %', constraint_record.constraint_name;
    END LOOP;
END $$;

-- 3. Verificar que profiles existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'profiles'
    ) THEN
        RAISE EXCEPTION 'La tabla profiles no existe.';
    END IF;
    RAISE NOTICE 'Tabla profiles existe ✓';
END $$;

-- 4. Crear nuevas foreign keys que apunten a profiles
ALTER TABLE investigaciones 
ADD CONSTRAINT fk_investigaciones_responsable_profiles 
FOREIGN KEY (responsable_id) 
REFERENCES profiles(id) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

ALTER TABLE investigaciones 
ADD CONSTRAINT fk_investigaciones_implementador_profiles 
FOREIGN KEY (implementador_id) 
REFERENCES profiles(id) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

ALTER TABLE investigaciones 
ADD CONSTRAINT fk_investigaciones_creado_por_profiles 
FOREIGN KEY (creado_por) 
REFERENCES profiles(id) 
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
    RAISE NOTICE '📋 Ahora investigaciones.responsable_id apunta a profiles(id)';
    RAISE NOTICE '📋 Ahora investigaciones.implementador_id apunta a profiles(id)';
    RAISE NOTICE '📋 Ahora investigaciones.creado_por apunta a profiles(id)';
    RAISE NOTICE '🔍 Esto es consistente con usuarios_con_roles que también usa profiles';
END $$; 