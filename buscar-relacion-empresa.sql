-- Buscar relación entre investigaciones y empresas

-- 1. VERIFICAR ESTRUCTURA COMPLETA DE INVESTIGACIONES
SELECT 
  'ESTRUCTURA COMPLETA' as fuente,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'investigaciones'
ORDER BY ordinal_position;

-- 2. VERIFICAR SI HAY OTRAS TABLAS QUE RELACIONEN INVESTIGACIONES CON EMPRESAS
SELECT 
  'TABLAS CON INVESTIGACION_ID' as fuente,
  table_name,
  column_name
FROM information_schema.columns 
WHERE column_name = 'investigacion_id'
ORDER BY table_name;

-- 3. VERIFICAR SI HAY TABLAS CON EMPRESA_ID
SELECT 
  'TABLAS CON EMPRESA_ID' as fuente,
  table_name,
  column_name
FROM information_schema.columns 
WHERE column_name = 'empresa_id'
ORDER BY table_name;

-- 4. VERIFICAR DATOS DE INVESTIGACIONES
SELECT 
  'DATOS INVESTIGACIONES' as fuente,
  id,
  nombre
FROM investigaciones 
LIMIT 3; 