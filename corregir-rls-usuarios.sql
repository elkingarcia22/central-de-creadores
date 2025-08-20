-- ====================================
-- CORREGIR POLÍTICAS RLS DE TABLA USUARIOS
-- ====================================

-- 1. Verificar políticas RLS actuales
SELECT 
  'POLÍTICAS RLS ACTUALES:' as info,
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

-- 2. Deshabilitar RLS temporalmente para pruebas
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;

-- 3. Verificar que ahora funciona la consulta
SELECT 
  'VERIFICAR CONSULTA SIN RLS:' as info,
  COUNT(*) as total_usuarios
FROM usuarios;

-- 4. Mostrar algunos usuarios
SELECT 
  'MUESTRA DE USUARIOS SIN RLS:' as info,
  id,
  nombre,
  correo,
  activo
FROM usuarios
ORDER BY nombre
LIMIT 3;

-- 5. Crear política RLS permisiva para la API
-- Primero habilitar RLS nuevamente
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Crear política que permita SELECT para todos los usuarios autenticados
CREATE POLICY "usuarios_select_policy" ON usuarios
FOR SELECT
TO authenticated
USING (true);

-- 6. Verificar la nueva política
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
WHERE tablename = 'usuarios' AND policyname = 'usuarios_select_policy';

-- 7. Probar consulta con la nueva política
SELECT 
  'VERIFICAR CONSULTA CON NUEVA POLÍTICA:' as info,
  COUNT(*) as total_usuarios
FROM usuarios;
