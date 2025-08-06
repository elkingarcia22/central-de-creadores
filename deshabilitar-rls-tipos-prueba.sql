-- Script para deshabilitar RLS específicamente en la tabla tipos_prueba_cat
-- La tabla ya tiene los datos, solo necesitamos deshabilitar RLS

-- Verificamos el estado actual de RLS
SELECT 'Estado actual de RLS en tipos_prueba_cat:' as mensaje;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'tipos_prueba_cat';

-- Verificamos que la tabla tiene datos
SELECT 'Datos actuales en la tabla tipos_prueba_cat:' as mensaje;
SELECT COUNT(*) as total_tipos_prueba FROM tipos_prueba_cat;

-- Mostramos los datos existentes
SELECT 'Tipos de prueba existentes:' as mensaje;
SELECT id, nombre, activo FROM tipos_prueba_cat ORDER BY nombre;

-- Deshabilitamos RLS en la tabla tipos_prueba_cat
ALTER TABLE tipos_prueba_cat DISABLE ROW LEVEL SECURITY;

-- Verificamos que RLS se deshabilitó correctamente
SELECT 'Estado de RLS después de deshabilitar:' as mensaje;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'tipos_prueba_cat';

-- Verificamos que podemos acceder a los datos
SELECT 'Verificación de acceso a datos:' as mensaje;
SELECT COUNT(*) as total_tipos_prueba_accesibles FROM tipos_prueba_cat;

-- Mostramos los tipos de prueba disponibles
SELECT 'Tipos de prueba disponibles:' as mensaje;
SELECT id, nombre, activo FROM tipos_prueba_cat ORDER BY nombre; 