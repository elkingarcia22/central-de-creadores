-- ====================================
-- VERIFICAR Y CORREGIR SINCRONIZACIÓN DE USUARIOS
-- ====================================

-- 1. Verificar si el usuario KAM existe en usuarios
SELECT 
  'VERIFICAR USUARIO KAM EN USUARIOS:' as info,
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

-- 3. Insertar manualmente el usuario KAM
INSERT INTO usuarios (id, nombre, correo, activo)
VALUES (
  '9b1ef1eb-fdb4-410f-ab22-bfedc68294d6',
  'a',
  'a@gmail.com',
  true
)
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  correo = EXCLUDED.correo,
  activo = EXCLUDED.activo;

-- 4. Verificar el resultado
SELECT 
  'RESULTADO DESPUÉS DE INSERCIÓN:' as info,
  id,
  nombre,
  correo,
  activo
FROM usuarios
WHERE id = '9b1ef1eb-fdb4-410f-ab22-bfedc68294d6';

-- 5. Mostrar todos los usuarios en la tabla usuarios
SELECT 
  'TODOS LOS USUARIOS EN TABLA USUARIOS:' as info,
  COUNT(*) as total
FROM usuarios;

-- 6. Mostrar algunos usuarios como ejemplo
SELECT 
  'MUESTRA DE USUARIOS:' as info,
  id,
  nombre,
  correo,
  activo
FROM usuarios
ORDER BY nombre
LIMIT 3;
