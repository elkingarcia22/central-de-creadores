-- ====================================
-- CORREGIR FK DE CREADO_POR EN RECLUTAMIENTOS (VERSIÓN SEGURA)
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar la FK actual de creado_por
SELECT 
    'FK actual de creado_por:' as info,
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
  AND kcu.column_name = 'creado_por';

-- 2. Eliminar la FK actual de creado_por (si existe)
DO $$
BEGIN
    -- Intentar eliminar la FK si existe
    BEGIN
        ALTER TABLE reclutamientos DROP CONSTRAINT reclutamientos_creado_por_fkey;
        RAISE NOTICE 'FK reclutamientos_creado_por_fkey eliminada';
    EXCEPTION
        WHEN undefined_object THEN
            RAISE NOTICE 'La FK reclutamientos_creado_por_fkey no existe';
    END;
END $$;

-- 3. Crear nueva FK que apunte a usuarios (igual que reclutador_id)
ALTER TABLE reclutamientos 
ADD CONSTRAINT reclutamientos_creado_por_fkey 
FOREIGN KEY (creado_por) REFERENCES usuarios(id);

-- 4. Verificar que la FK se creó correctamente
SELECT 
    'FK corregida de creado_por:' as info,
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
  AND kcu.column_name = 'creado_por';

-- 5. Verificar usuarios disponibles (sin asumir nombres de columnas específicos)
SELECT 
    'Usuarios disponibles para reclutamientos:' as info,
    *
FROM usuarios 
LIMIT 5;

-- 6. Mensaje de confirmación
SELECT 
    '✅ FK de creado_por corregida exitosamente' as status,
    'Ahora creado_por apunta a usuarios(id) igual que reclutador_id' as descripcion; 