-- Script para deshabilitar RLS específicamente en la tabla paises
-- La tabla ya tiene los datos, solo necesitamos deshabilitar RLS

-- Verificamos el estado actual de RLS
SELECT 'Estado actual de RLS en paises:' as mensaje;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'paises';

-- Verificamos que la tabla tiene datos
SELECT 'Datos actuales en la tabla paises:' as mensaje;
SELECT COUNT(*) as total_paises FROM paises;

-- Deshabilitamos RLS en la tabla paises
ALTER TABLE paises DISABLE ROW LEVEL SECURITY;

-- Verificamos que RLS se deshabilitó correctamente
SELECT 'Estado de RLS después de deshabilitar:' as mensaje;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'paises';

-- Verificamos que podemos acceder a los datos
SELECT 'Verificación de acceso a datos:' as mensaje;
SELECT COUNT(*) as total_paises_accesibles FROM paises;

-- Mostramos algunos países para confirmar acceso
SELECT 'Primeros 10 países disponibles:' as mensaje;
SELECT id, nombre, activo FROM paises ORDER BY nombre LIMIT 10; 