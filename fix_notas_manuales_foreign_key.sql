-- Arreglar foreign key de notas_manuales
-- Primero eliminar la constraint existente
ALTER TABLE notas_manuales DROP CONSTRAINT IF EXISTS notas_manuales_sesion_id_fkey;

-- Agregar nueva constraint que apunte a reclutamientos en lugar de sesiones
ALTER TABLE notas_manuales 
ADD CONSTRAINT notas_manuales_sesion_id_fkey 
FOREIGN KEY (sesion_id) REFERENCES reclutamientos(id) ON DELETE CASCADE;

-- Verificar que la constraint se creó correctamente
SELECT 
    tc.constraint_name, 
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
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name='notas_manuales';
