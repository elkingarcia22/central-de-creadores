-- Verificar estructura de participantes_internos

-- 1. VER ESTRUCTURA DE LA TABLA
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'participantes_internos'
ORDER BY ordinal_position;

-- 2. VER EJEMPLO DE DATOS
SELECT *
FROM participantes_internos 
LIMIT 3;

-- 3. VER CUALQUIER PARTICIPANTE INTERNO VÁLIDO
SELECT 
    'PARTICIPANTE INTERNO VÁLIDO' as fuente,
    id
FROM participantes_internos 
LIMIT 1; 