-- ====================================
-- DESHABILITAR RLS TEMPORALMENTE EN TABLA PARTICIPANTES
-- ====================================
-- Ejecutar en el SQL Editor de Supabase para solucionar recursión infinita

-- 1. Deshabilitar RLS en la tabla participantes
ALTER TABLE participantes DISABLE ROW LEVEL SECURITY;

-- 2. Verificar que RLS está deshabilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'participantes';

-- 3. Listar las políticas existentes (para referencia)
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'participantes';

-- 4. Eliminar políticas problemáticas si es necesario
-- DROP POLICY IF EXISTS "nombre_politica_problematica" ON participantes;

-- 5. Verificar que la tabla es accesible
SELECT COUNT(*) as total_participantes FROM participantes;

-- 6. Probar inserción simple
INSERT INTO participantes (nombre, rol_empresa_id, dolores_necesidades, total_participaciones)
VALUES ('Test Participante', NULL, 'Test dolores', 0)
ON CONFLICT DO NOTHING;

-- 7. Verificar inserción
SELECT * FROM participantes WHERE nombre = 'Test Participante';

-- NOTA: Este script deshabilita RLS temporalmente para solucionar el problema
-- de recursión infinita. Una vez que el sistema funcione, se pueden recrear
-- las políticas de RLS de manera más simple. 