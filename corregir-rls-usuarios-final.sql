-- ====================================
-- CORREGIR RLS PARA PERMITIR CONSULTAS DESDE APIs
-- ====================================

-- 1. Verificar políticas actuales
SELECT 
  'POLÍTICAS ACTUALES:' as info,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'usuarios';

-- 2. Eliminar política anterior si existe
DROP POLICY IF EXISTS "usuarios_select_policy" ON usuarios;

-- 3. Crear política que permita SELECT para todos (incluyendo APIs)
CREATE POLICY "usuarios_select_all_policy" ON usuarios
FOR SELECT
TO public
USING (true);

-- 4. Verificar la nueva política
SELECT 
  'NUEVA POLÍTICA CREADA:' as info,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'usuarios' AND policyname = 'usuarios_select_all_policy';

-- 5. Probar consulta
SELECT 
  'VERIFICAR CONSULTA CON NUEVA POLÍTICA:' as info,
  COUNT(*) as total_usuarios
FROM usuarios;

-- 6. Mostrar algunos usuarios
SELECT 
  'MUESTRA DE USUARIOS:' as info,
  id,
  nombre,
  correo,
  activo
FROM usuarios
ORDER BY nombre
LIMIT 3;
