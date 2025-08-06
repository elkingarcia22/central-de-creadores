-- Corregir foreign key de tabla participantes
-- Cambiar de kams a usuarios

-- 1. Eliminar la foreign key existente
ALTER TABLE participantes 
DROP CONSTRAINT IF EXISTS participantes_kam_id_fkey;

-- 2. Crear la nueva foreign key que apunte a usuarios
ALTER TABLE participantes 
ADD CONSTRAINT participantes_kam_id_fkey 
FOREIGN KEY (kam_id) REFERENCES usuarios(id);

-- 3. Verificar que la corrección funcionó
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
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name='participantes' 
    AND kcu.column_name='kam_id'; 