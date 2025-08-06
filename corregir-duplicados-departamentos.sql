-- ====================================
-- CORREGIR DUPLICADOS EN DEPARTAMENTOS
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar duplicados existentes
SELECT 'Verificando duplicados:' as info;
SELECT nombre, COUNT(*) as cantidad
FROM departamentos 
GROUP BY nombre 
HAVING COUNT(*) > 1
ORDER BY nombre;

-- 2. Eliminar registros duplicados (mantener solo el primero)
DELETE FROM departamentos 
WHERE id NOT IN (
    SELECT MIN(id) 
    FROM departamentos 
    GROUP BY nombre
);

-- 3. Verificar que no hay duplicados
SELECT 'Verificando que no hay duplicados:' as info;
SELECT nombre, COUNT(*) as cantidad
FROM departamentos 
GROUP BY nombre 
HAVING COUNT(*) > 1
ORDER BY nombre;

-- 4. Mostrar departamentos únicos por categoría
SELECT 'Departamentos por categoría:' as info;
SELECT categoria, COUNT(*) as total
FROM departamentos 
WHERE activo = true
GROUP BY categoria 
ORDER BY categoria;

-- 5. Mostrar total de departamentos
SELECT 'Total de departamentos:' as info;
SELECT COUNT(*) as total_departamentos
FROM departamentos 
WHERE activo = true; 