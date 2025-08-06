-- Script simple para deshabilitar RLS en modalidades
-- Los datos ya existen, solo necesitamos acceso

-- Verificar que la tabla existe y tiene datos
SELECT 'Verificando tabla modalidades existente:' as mensaje;
SELECT COUNT(*) as total_modalidades FROM modalidades;

-- Mostrar datos actuales
SELECT 'Modalidades actuales en la tabla:' as mensaje;
SELECT id, nombre, activo FROM modalidades ORDER BY nombre;

-- Verificar estado actual de RLS
SELECT 'Estado actual de RLS:' as mensaje;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'modalidades';

-- Deshabilitar RLS para permitir acceso público
ALTER TABLE modalidades DISABLE ROW LEVEL SECURITY;

-- Verificar que RLS se deshabilitó
SELECT 'Estado de RLS después de deshabilitar:' as mensaje;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'modalidades';

-- Verificar acceso final
SELECT 'Verificación final - modalidades accesibles:' as mensaje;
SELECT COUNT(*) as total_accesibles FROM modalidades;
SELECT id, nombre, activo FROM modalidades ORDER BY nombre; 