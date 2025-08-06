-- Verificar estructura de empresas
SELECT 
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'empresas' 
ORDER BY ordinal_position;

-- Ver datos de ejemplo
SELECT * FROM empresas LIMIT 3; 