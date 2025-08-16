-- ====================================
-- VERIFICAR ESTRUCTURA DE LIBRETOS_INVESTIGACION
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- Verificar estructura de la tabla libretos_investigacion
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'libretos_investigacion' 
ORDER BY ordinal_position;
