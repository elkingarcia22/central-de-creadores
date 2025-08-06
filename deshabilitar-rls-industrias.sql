-- Script para deshabilitar RLS específicamente en la tabla industrias

-- Verificamos el estado actual de RLS
SELECT 'Estado actual de RLS en industrias:' as mensaje;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'industrias';

-- Deshabilitamos RLS en la tabla industrias
ALTER TABLE industrias DISABLE ROW LEVEL SECURITY;

-- Verificamos que RLS se deshabilitó correctamente
SELECT 'Estado de RLS después de deshabilitar:' as mensaje;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'industrias';

-- Verificamos que podemos acceder a los datos
SELECT 'Verificación de acceso a datos:' as mensaje;
SELECT COUNT(*) as total_industrias FROM industrias;

-- Mostramos algunas industrias para confirmar acceso
SELECT 'Primeras 5 industrias disponibles:' as mensaje;
SELECT id, nombre, activo FROM industrias LIMIT 5; 