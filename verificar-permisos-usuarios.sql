-- VERIFICAR PERMISOS DE LA TABLA USUARIOS
-- Script para diagnosticar y corregir problemas de RLS

-- 1. Verificar si RLS está habilitado en la tabla usuarios
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'usuarios';

-- 2. Verificar políticas existentes
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'usuarios';

-- 3. Verificar permisos de tabla para roles anónimos
SELECT 
  table_name,
  privilege_type,
  grantee
FROM information_schema.table_privileges 
WHERE table_name = 'usuarios' 
  AND grantee IN ('anon', 'authenticated', 'public');

-- 4. Verificar datos directamente (sin RLS)
SELECT 
  'USUARIOS SIN RLS' as info,
  COUNT(*) as total
FROM usuarios;

-- 5. Mostrar algunos usuarios directamente
SELECT 
  id,
  nombre,
  correo,
  activo
FROM usuarios
WHERE activo = true
LIMIT 3;

-- 6. Si RLS está bloqueando, crear política temporal para testing
-- NOTA: Ejecutar solo si es necesario
/*
-- Deshabilitar RLS temporalmente para testing
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;

-- O crear una política permisiva para anon/authenticated
CREATE POLICY "Permitir lectura usuarios activos" ON usuarios
  FOR SELECT 
  TO anon, authenticated
  USING (activo = true);
*/
