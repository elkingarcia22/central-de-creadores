-- Verificar estructura real de las tablas históricas

-- 1. ESTRUCTURA DE HISTORIAL PARTICIPANTES
SELECT 
  'HISTORIAL_PARTICIPACION_PARTICIPANTES' as tabla,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'historial_participacion_participantes'
ORDER BY ordinal_position;

-- 2. ESTRUCTURA DE HISTORIAL EMPRESAS
SELECT 
  'HISTORIAL_PARTICIPACION_EMPRESAS' as tabla,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'historial_participacion_empresas'
ORDER BY ordinal_position;

-- 3. ESTRUCTURA DE RECLUTAMIENTOS
SELECT 
  'RECLUTAMIENTOS' as tabla,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'reclutamientos'
ORDER BY ordinal_position; 