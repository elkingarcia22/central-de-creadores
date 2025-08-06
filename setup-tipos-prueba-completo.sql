-- Script completo para configurar tipos_prueba_cat
-- Incluye inserción de datos y deshabilitación de RLS

-- Verificar si la tabla existe
SELECT 'Verificando existencia de tabla tipos_prueba_cat:' as mensaje;
SELECT COUNT(*) as tabla_existe 
FROM information_schema.tables 
WHERE table_name = 'tipos_prueba_cat';

-- Crear tabla si no existe
CREATE TABLE IF NOT EXISTS tipos_prueba_cat (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre text NOT NULL,
    activo boolean DEFAULT true
);

-- Insertar datos (con ON CONFLICT para evitar duplicados)
INSERT INTO "public"."tipos_prueba_cat" ("id", "nombre", "activo") 
VALUES 
    ('6aae0543-073c-4c08-adee-86885dc2918f', 'Sesión con usuarios', true), 
    ('acd7bf47-dd75-4caf-9e28-3daf64391794', 'Prueba rápida', true)
ON CONFLICT (id) DO UPDATE SET 
    nombre = EXCLUDED.nombre,
    activo = EXCLUDED.activo;

-- Verificar que los datos se insertaron
SELECT 'Datos insertados en tipos_prueba_cat:' as mensaje;
SELECT id, nombre, activo FROM tipos_prueba_cat ORDER BY nombre;

-- Verificar estado actual de RLS
SELECT 'Estado actual de RLS en tipos_prueba_cat:' as mensaje;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'tipos_prueba_cat';

-- Deshabilitar RLS para acceso público
ALTER TABLE tipos_prueba_cat DISABLE ROW LEVEL SECURITY;

-- Verificar que RLS se deshabilitó
SELECT 'Estado de RLS después de deshabilitar:' as mensaje;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'tipos_prueba_cat';

-- Verificar acceso final a los datos
SELECT 'Verificación final - tipos de prueba disponibles:' as mensaje;
SELECT COUNT(*) as total_tipos_prueba FROM tipos_prueba_cat;
SELECT id, nombre, activo FROM tipos_prueba_cat ORDER BY nombre; 