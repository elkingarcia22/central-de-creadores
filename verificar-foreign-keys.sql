-- VERIFICAR FOREIGN KEYS DE LA TABLA EMPRESAS
-- Script para diagnosticar problemas con las relaciones

-- 1. Verificar todas las foreign keys de la tabla empresas
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'empresas';

-- 2. Verificar específicamente la foreign key del KAM
SELECT 
  'KAM FOREIGN KEY' as info,
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'empresas'
  AND kcu.column_name = 'kam_id';

-- 3. Verificar si el KAM existe en profiles
SELECT 
  'KAM EN PROFILES' as info,
  e.kam_id,
  p.full_name,
  p.email,
  p.id as profile_id
FROM empresas e
LEFT JOIN profiles p ON e.kam_id = p.id
LIMIT 5;

-- 4. Verificar si el KAM existe en usuarios
SELECT 
  'KAM EN USUARIOS' as info,
  e.kam_id,
  u.nombre,
  u.correo,
  u.id as usuario_id
FROM empresas e
LEFT JOIN usuarios u ON e.kam_id = u.id
LIMIT 5;

-- 5. Verificar estructura de la tabla empresas
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'empresas'
  AND column_name = 'kam_id';
