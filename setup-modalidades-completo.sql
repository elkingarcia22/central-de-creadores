-- Script completo para configurar modalidades
-- Incluye inserción de datos y deshabilitación de RLS

-- Verificar si la tabla existe
SELECT 'Verificando existencia de tabla modalidades:' as mensaje;
SELECT COUNT(*) as tabla_existe 
FROM information_schema.tables 
WHERE table_name = 'modalidades';

-- Crear tabla si no existe
CREATE TABLE IF NOT EXISTS modalidades (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre text NOT NULL,
    activo boolean DEFAULT true
);

-- Insertar datos (con ON CONFLICT para evitar duplicados)
INSERT INTO "public"."modalidades" ("id", "nombre", "activo") 
VALUES 
    ('0738bd51-2cd7-4446-a8a1-c1cbcb66fc6c', 'presencial', true), 
    ('2c569742-edc4-47b8-938f-73a03c2dbcda', 'hibrido', true), 
    ('b52b40d9-beff-4471-9983-6141daccaf35', 'remoto', true)
ON CONFLICT (id) DO UPDATE SET 
    nombre = EXCLUDED.nombre,
    activo = EXCLUDED.activo;

-- Verificar que los datos se insertaron
SELECT 'Datos insertados en modalidades:' as mensaje;
SELECT id, nombre, activo FROM modalidades ORDER BY nombre;

-- Verificar estado actual de RLS
SELECT 'Estado actual de RLS en modalidades:' as mensaje;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'modalidades';

-- Deshabilitar RLS para acceso público
ALTER TABLE modalidades DISABLE ROW LEVEL SECURITY;

-- Verificar que RLS se deshabilitó
SELECT 'Estado de RLS después de deshabilitar:' as mensaje;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'modalidades';

-- Verificar acceso final a los datos
SELECT 'Verificación final - modalidades disponibles:' as mensaje;
SELECT COUNT(*) as total_modalidades FROM modalidades;
SELECT id, nombre, activo FROM modalidades ORDER BY nombre; 