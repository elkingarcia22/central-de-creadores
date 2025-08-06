-- ====================================
-- VERIFICAR FOREIGN KEY EMPRESAS-USUARIOS
-- ====================================

-- 1. VERIFICAR FOREIGN KEYS EXISTENTES
SELECT '=== FOREIGN KEYS EXISTENTES ===' as info;
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
ORDER BY kcu.column_name;

-- 2. VERIFICAR ESPECÍFICAMENTE KAM_ID
SELECT '=== FOREIGN KEY KAM_ID ===' as info;
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

-- 3. VERIFICAR DATOS DE EJEMPLO
SELECT '=== DATOS DE EJEMPLO ===' as info;
SELECT 
    e.id as empresa_id,
    e.nombre as empresa_nombre,
    e.kam_id,
    u.id as usuario_id,
    u.nombre as usuario_nombre
FROM empresas e
LEFT JOIN usuarios u ON e.kam_id = u.id
LIMIT 3;

-- 4. VERIFICAR SI HAY DATOS VÁLIDOS
SELECT '=== VERIFICAR DATOS VÁLIDOS ===' as info;
SELECT 
    COUNT(*) as total_empresas,
    COUNT(kam_id) as empresas_con_kam,
    COUNT(*) - COUNT(kam_id) as empresas_sin_kam
FROM empresas;

-- 5. MENSAJE FINAL
SELECT '✅ Verificación de foreign key completada' as resultado; 