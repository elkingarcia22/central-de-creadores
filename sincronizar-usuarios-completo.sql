-- ====================================
-- SINCRONIZAR TODOS LOS USUARIOS DE PROFILES A USUARIOS
-- ====================================

-- 1. Verificar usuarios en profiles
SELECT 
  'USUARIOS EN PROFILES:' as info,
  COUNT(*) as total
FROM profiles;

-- 2. Verificar usuarios en tabla usuarios
SELECT 
  'USUARIOS EN TABLA USUARIOS:' as info,
  COUNT(*) as total
FROM usuarios;

-- 3. Sincronizar todos los usuarios de profiles a usuarios
INSERT INTO usuarios (id, nombre, correo, activo)
SELECT 
  id,
  full_name,
  email,
  true
FROM profiles
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  correo = EXCLUDED.correo,
  activo = EXCLUDED.activo;

-- 4. Verificar el resultado
SELECT 
  'RESULTADO SINCRONIZACIÓN:' as info,
  COUNT(*) as total_usuarios
FROM usuarios;

-- 5. Verificar el usuario KAM específico
SELECT 
  'VERIFICAR USUARIO KAM:' as info,
  id,
  nombre,
  correo,
  activo
FROM usuarios
WHERE id = '9b1ef1eb-fdb4-410f-ab22-bfedc68294d6';

-- 6. Mostrar algunos usuarios sincronizados
SELECT 
  'MUESTRA DE USUARIOS:' as info,
  id,
  nombre,
  correo,
  activo
FROM usuarios
ORDER BY nombre
LIMIT 5;
