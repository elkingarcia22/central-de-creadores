-- Script para deshabilitar RLS específicamente en la tabla modalidades
-- La tabla ya tiene los datos, solo necesitamos deshabilitar RLS

-- Verificamos el estado actual de RLS
SELECT 'Estado actual de RLS en modalidades:' as mensaje;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'modalidades';

-- Verificamos que la tabla tiene datos
SELECT 'Datos actuales en la tabla modalidades:' as mensaje;
SELECT COUNT(*) as total_modalidades FROM modalidades;

-- Mostramos los datos existentes
SELECT 'Modalidades existentes:' as mensaje;
SELECT id, nombre, activo FROM modalidades ORDER BY nombre;

-- Deshabilitamos RLS en la tabla modalidades
ALTER TABLE modalidades DISABLE ROW LEVEL SECURITY;

-- Verificamos que RLS se deshabilitó correctamente
SELECT 'Estado de RLS después de deshabilitar:' as mensaje;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'modalidades';

-- Verificamos que podemos acceder a los datos
SELECT 'Verificación de acceso a datos:' as mensaje;
SELECT COUNT(*) as total_modalidades_accesibles FROM modalidades;

-- Mostramos las modalidades disponibles
SELECT 'Modalidades disponibles:' as mensaje;
SELECT id, nombre, activo FROM modalidades ORDER BY nombre; 