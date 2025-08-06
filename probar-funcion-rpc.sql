-- ====================================
-- PROBAR FUNCIÓN RPC
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- Probar la función RPC con el participante específico
SELECT * FROM obtener_participantes_detalle(ARRAY['bdcf99c2-4022-44b8-8c16-2e115b6c1245']::uuid[]);

-- Verificar si la función existe
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name = 'obtener_participantes_detalle';

-- Probar con múltiples participantes
SELECT * FROM obtener_participantes_detalle(ARRAY[
    'bdcf99c2-4022-44b8-8c16-2e115b6c1245',
    '740e6e80-e8cc-4157-9e3f-237ca3868b46'
]::uuid[]); 