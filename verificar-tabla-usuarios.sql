-- Verificar estructura real de la tabla usuarios

-- 1. Verificar columnas de la tabla usuarios
SELECT 'USUARIOS' as tabla, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'usuarios'
ORDER BY ordinal_position;

-- 2. Mostrar algunos registros de ejemplo para ver la estructura real
SELECT 'EJEMPLO_USUARIOS' as tipo, * FROM public.usuarios LIMIT 3;

-- 3. Contar total de usuarios
SELECT 'CONTEO_USUARIOS' as tabla, COUNT(*) as total FROM public.usuarios;
