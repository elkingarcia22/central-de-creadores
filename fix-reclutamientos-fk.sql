-- ====================================
-- CORREGIR FK DE RECLUTAMIENTOS PARA USAR PROFILES
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar la FK actual de reclutador_id
SELECT 
    'FK actual de reclutador_id:' as info,
    tc.constraint_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'reclutamientos'
  AND kcu.column_name = 'reclutador_id';

-- 2. Eliminar la FK actual de reclutador_id (si existe)
DO $$
BEGIN
    -- Intentar eliminar la FK si existe
    BEGIN
        ALTER TABLE reclutamientos DROP CONSTRAINT reclutamientos_reclutador_id_fkey;
        RAISE NOTICE 'FK reclutamientos_reclutador_id_fkey eliminada';
    EXCEPTION
        WHEN undefined_object THEN
            RAISE NOTICE 'La FK reclutamientos_reclutador_id_fkey no existe';
    END;
END $$;

-- 3. Crear nueva FK que apunte a profiles (Supabase Auth)
ALTER TABLE reclutamientos 
ADD CONSTRAINT reclutamientos_reclutador_id_fkey 
FOREIGN KEY (reclutador_id) REFERENCES profiles(id);

-- 4. Verificar que la FK se creó correctamente
SELECT 
    'FK corregida de reclutador_id:' as info,
    tc.constraint_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'reclutamientos'
  AND kcu.column_name = 'reclutador_id';

-- 5. Verificar usuarios disponibles en profiles
SELECT 
    'Usuarios disponibles en profiles:' as info,
    COUNT(*) as total_usuarios
FROM profiles;

-- 6. Mostrar algunos usuarios de ejemplo
SELECT 
    'Ejemplos de usuarios en profiles:' as info,
    id,
    full_name,
    email
FROM profiles 
LIMIT 5;
