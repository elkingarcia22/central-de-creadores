-- DIAGNÓSTICO COMPLETO DE EMPRESAS
-- Verificar por qué no se muestran empresas en la tabla

-- 1. VERIFICAR SI LA TABLA EMPRESAS EXISTE Y TIENE DATOS
SELECT 
  'TABLA EMPRESAS' as seccion,
  COUNT(*) as total_empresas
FROM empresas;

-- 2. MOSTRAR LAS PRIMERAS 5 EMPRESAS
SELECT 
  'MUESTRA EMPRESAS' as seccion,
  id,
  nombre,
  sector,
  activo,
  created_at
FROM empresas 
ORDER BY created_at DESC 
LIMIT 5;

-- 3. VERIFICAR ESTRUCTURA DE LA TABLA
SELECT 
  'ESTRUCTURA TABLA' as seccion,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'empresas' 
ORDER BY ordinal_position;

-- 4. VERIFICAR SI HAY RELACIÓN CON USUARIOS (KAM)
SELECT 
  'EMPRESAS CON KAM' as seccion,
  e.id,
  e.nombre,
  e.kam_id,
  u.name as kam_nombre
FROM empresas e
LEFT JOIN usuarios u ON e.kam_id = u.id
LIMIT 5;

-- 5. VERIFICAR SI HAY ERRORES EN LA RELACIÓN
SELECT 
  'ERRORES EN RELACIÓN KAM' as seccion,
  e.id,
  e.nombre,
  e.kam_id
FROM empresas e
WHERE e.kam_id IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM usuarios u WHERE u.id = e.kam_id);

-- 6. VERIFICAR PERMISOS DE LA TABLA
SELECT 
  'PERMISOS TABLA' as seccion,
  table_name,
  privilege_type
FROM information_schema.table_privileges 
WHERE table_name = 'empresas';
