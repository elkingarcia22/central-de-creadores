-- Verificar estructura completa de reclutamientos

-- 1. VER TODAS LAS COLUMNAS
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'reclutamientos'
ORDER BY ordinal_position;

-- 2. VER EJEMPLO DE DATOS
SELECT *
FROM reclutamientos 
LIMIT 3;

-- 3. BUSCAR COLUMNAS RELACIONADAS
SELECT 
    column_name
FROM information_schema.columns 
WHERE table_name = 'reclutamientos'
AND (
    column_name LIKE '%empresa%' 
    OR column_name LIKE '%participante%'
    OR column_name LIKE '%estado%'
    OR column_name LIKE '%sesion%'
)
ORDER BY column_name; 