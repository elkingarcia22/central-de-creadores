-- ====================================
-- VERIFICAR USUARIO KAM EN TABLA USUARIOS
-- ====================================

-- 1. Verificar si el usuario KAM existe en la tabla usuarios
SELECT 
  'VERIFICAR USUARIO KAM:' as info,
  id,
  nombre,
  correo,
  activo
FROM usuarios
WHERE id = '9b1ef1eb-fdb4-410f-ab22-bfedc68294d6';

-- 2. Verificar si existe en profiles
SELECT 
  'VERIFICAR EN PROFILES:' as info,
  id,
  full_name,
  email
FROM profiles
WHERE id = '9b1ef1eb-fdb4-410f-ab22-bfedc68294d6';

-- 3. Si no existe en usuarios, insertarlo desde profiles
INSERT INTO usuarios (id, nombre, correo, activo)
SELECT 
  id,
  full_name,
  email,
  true
FROM profiles
WHERE id = '9b1ef1eb-fdb4-410f-ab22-bfedc68294d6'
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  correo = EXCLUDED.correo,
  activo = EXCLUDED.activo;

-- 4. Verificar el resultado
SELECT 
  'RESULTADO FINAL:' as info,
  id,
  nombre,
  correo,
  activo
FROM usuarios
WHERE id = '9b1ef1eb-fdb4-410f-ab22-bfedc68294d6';
