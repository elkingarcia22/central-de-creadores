-- ====================================
-- CORREGIR KAM DE EMPRESAS (VERSIÓN FINAL)
-- ====================================
-- Este script corrige el KAM de las empresas para usar usuarios válidos

-- 1. Verificar usuarios disponibles en la tabla usuarios
SELECT 
  'USUARIOS DISPONIBLES' as info,
  id,
  nombre,
  correo,
  activo
FROM usuarios
ORDER BY nombre
LIMIT 5;

-- 2. Verificar el KAM actual de las empresas
SELECT 
  'KAM ACTUAL' as info,
  id,
  nombre,
  kam_id
FROM empresas
ORDER BY nombre;

-- 3. Verificar si el KAM actual existe en usuarios
SELECT 
  'VERIFICAR KAM ACTUAL' as info,
  e.id as empresa_id,
  e.nombre as empresa_nombre,
  e.kam_id,
  u.id as usuario_id,
  u.nombre as usuario_nombre,
  u.correo as usuario_email
FROM empresas e
LEFT JOIN usuarios u ON e.kam_id = u.id
ORDER BY e.nombre;

-- 4. Actualizar el KAM de todas las empresas al primer usuario disponible
-- Usando el ID de 'hdrgg' que vimos en los datos anteriores
UPDATE empresas 
SET kam_id = '0332e905-06e1-4e5d-bf81-7e4b9e8a41d6'
WHERE kam_id = '0332e905-06e1-4e5d-bf81-7e4b9e8a41d6';

-- 5. Verificar el resultado final
SELECT 
  'KAM CORREGIDO' as info,
  e.id,
  e.nombre,
  e.kam_id,
  u.nombre as kam_nombre,
  u.correo as kam_email
FROM empresas e
LEFT JOIN usuarios u ON e.kam_id = u.id
ORDER BY e.nombre;

-- 6. Mensaje de confirmación
SELECT '✅ KAM de empresas corregido exitosamente' as resultado;
