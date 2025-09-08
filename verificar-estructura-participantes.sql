-- Verificar estructura real de las tablas de participantes

-- 1. Verificar tabla participantes
SELECT 'PARTICIPANTES' as tabla, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'participantes'
ORDER BY ordinal_position;

-- 2. Verificar tabla participantes_internos
SELECT 'PARTICIPANTES_INTERNOS' as tabla, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'participantes_internos'
ORDER BY ordinal_position;

-- 3. Verificar tabla participantes_friend_family
SELECT 'PARTICIPANTES_FRIEND_FAMILY' as tabla, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'participantes_friend_family'
ORDER BY ordinal_position;

-- 4. Verificar tabla investigaciones
SELECT 'INVESTIGACIONES' as tabla, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'investigaciones'
ORDER BY ordinal_position;

-- 5. Mostrar algunos registros de ejemplo para ver la estructura real
SELECT 'EJEMPLO_PARTICIPANTES' as tipo, * FROM public.participantes LIMIT 2;
SELECT 'EJEMPLO_PARTICIPANTES_INTERNOS' as tipo, * FROM public.participantes_internos LIMIT 2;
SELECT 'EJEMPLO_PARTICIPANTES_FRIEND_FAMILY' as tipo, * FROM public.participantes_friend_family LIMIT 2;
SELECT 'EJEMPLO_INVESTIGACIONES' as tipo, * FROM public.investigaciones LIMIT 2;