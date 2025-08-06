-- ====================================
-- CAMBIAR RELACIÓN KAM_ID DE KAMS A USUARIOS
-- ====================================

-- 1. Eliminar la foreign key existente que apunta a kams
ALTER TABLE empresas 
DROP CONSTRAINT IF EXISTS empresas_kam_id_fkey;

-- 2. Crear la nueva foreign key que apunte a usuarios
ALTER TABLE empresas 
ADD CONSTRAINT empresas_kam_id_fkey 
FOREIGN KEY (kam_id) REFERENCES usuarios(id);

-- 3. Verificar que el cambio se realizó correctamente
SELECT '=== VERIFICACIÓN DEL CAMBIO ===' as info;

-- Verificar la nueva foreign key
SELECT 
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
  AND tc.table_name = 'empresas'
  AND kcu.column_name = 'kam_id';

-- 4. Mensaje de confirmación
SELECT '✅ Relación kam_id cambiada exitosamente de kams a usuarios' as resultado; 