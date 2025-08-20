-- ACTUALIZAR KAM DE EMPRESAS
-- Script para corregir el KAM de las empresas

-- 1. Verificar qué usuarios existen en profiles
SELECT 
  'USUARIOS EN PROFILES' as info,
  id,
  full_name,
  email
FROM profiles
ORDER BY full_name
LIMIT 5;

-- 2. Verificar el KAM actual de las empresas
SELECT 
  'KAM ACTUAL' as info,
  id,
  nombre,
  kam_id
FROM empresas;

-- 3. Actualizar el KAM de todas las empresas al primer usuario disponible
-- Usando el ID de 'a' que vimos en los logs
UPDATE empresas 
SET kam_id = '9b1ef1eb-fdb4-410f-ab22-bfedc68294d6'
WHERE kam_id = '0332e905-06e1-4e5d-bf81-7e4b9e8a41d6';

-- 4. Verificar el cambio
SELECT 
  'KAM ACTUALIZADO' as info,
  e.id,
  e.nombre,
  e.kam_id,
  p.full_name as kam_nombre,
  p.email as kam_email
FROM empresas e
LEFT JOIN profiles p ON e.kam_id = p.id
ORDER BY e.nombre;
