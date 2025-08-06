-- Script para deshabilitar RLS específicamente en la tabla tamano_empresa
-- La tabla ya tiene los datos, solo necesitamos deshabilitar RLS

-- Verificamos el estado actual de RLS
SELECT 'Estado actual de RLS en tamano_empresa:' as mensaje;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'tamano_empresa';

-- Verificamos que la tabla tiene datos
SELECT 'Datos actuales en la tabla tamano_empresa:' as mensaje;
SELECT COUNT(*) as total_tamanos FROM tamano_empresa;

-- Mostramos los datos existentes
SELECT 'Tamaños de empresa existentes:' as mensaje;
SELECT id, nombre, activo FROM tamano_empresa ORDER BY nombre;

-- Deshabilitamos RLS en la tabla tamano_empresa
ALTER TABLE tamano_empresa DISABLE ROW LEVEL SECURITY;

-- Verificamos que RLS se deshabilitó correctamente
SELECT 'Estado de RLS después de deshabilitar:' as mensaje;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'tamano_empresa';

-- Verificamos que podemos acceder a los datos
SELECT 'Verificación de acceso a datos:' as mensaje;
SELECT COUNT(*) as total_tamanos_accesibles FROM tamano_empresa;

-- Mostramos los tamaños de empresa disponibles
SELECT 'Tamaños de empresa disponibles:' as mensaje;
SELECT id, nombre, activo FROM tamano_empresa ORDER BY nombre; 