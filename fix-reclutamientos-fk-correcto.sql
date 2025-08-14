-- ====================================
-- CORREGIR FK DE RECLUTAMIENTOS - ESTRUCTURA REAL VERIFICADA
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- DOCUMENTACIÓN:
-- Tabla profiles: usuarios de Supabase Auth (IDs: 235d3a57-6c9d-44b6-9f86-2d10e7761ce7, etc.)
-- Tabla usuarios: tabla de negocio (IDs: bea59fc5-812f-4b71-8228-a50ffc85c2e8, etc.)
-- API /api/usuarios: devuelve usuarios de profiles
-- FK actual: reclutamientos.reclutador_id -> usuarios.id (INCORRECTO)
-- FK necesaria: reclutamientos.reclutador_id -> profiles.id (CORRECTO)

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

-- 2. Eliminar la FK actual de reclutador_id
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

-- 6. Mostrar algunos usuarios de ejemplo en profiles
SELECT 
    'Ejemplos de usuarios en profiles:' as info,
    id,
    full_name,
    email
FROM profiles 
LIMIT 5;

-- 7. Verificar que los reclutamientos existentes tienen reclutadores válidos
SELECT 
    'Verificación de reclutamientos existentes:' as info,
    r.id as reclutamiento_id,
    r.reclutador_id,
    p.full_name as reclutador_nombre,
    p.email as reclutador_email,
    CASE 
        WHEN p.id IS NOT NULL THEN 'VÁLIDO'
        ELSE 'INVÁLIDO - No existe en profiles'
    END as estado
FROM reclutamientos r
LEFT JOIN profiles p ON r.reclutador_id = p.id
ORDER BY estado DESC;
