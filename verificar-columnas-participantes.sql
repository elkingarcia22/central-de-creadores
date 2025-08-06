-- ====================================
-- VERIFICAR COLUMNAS EXACTAS DE PARTICIPANTES
-- ====================================

-- Verificar las columnas de la tabla participantes
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'participantes'
ORDER BY ordinal_position;

-- Verificar algunos datos de ejemplo
SELECT 
    'Datos ejemplo' as tipo,
    *
FROM participantes 
LIMIT 1; 