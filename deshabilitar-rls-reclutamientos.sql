-- ====================================
-- DESHABILITAR RLS TEMPORALMENTE EN TABLA RECLUTAMIENTOS
-- ====================================
-- Ejecutar en el SQL Editor de Supabase para solucionar problemas de RLS

-- 1. Deshabilitar RLS en la tabla reclutamientos
ALTER TABLE reclutamientos DISABLE ROW LEVEL SECURITY;

-- 2. Verificar que RLS está deshabilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'reclutamientos';

-- 3. Listar las políticas existentes (para referencia)
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'reclutamientos';

-- 4. Verificar que la tabla es accesible
SELECT COUNT(*) as total_reclutamientos FROM reclutamientos;

-- 5. Probar inserción simple
INSERT INTO reclutamientos (
  investigacion_id, 
  participantes_id, 
  fecha_asignado, 
  reclutador_id, 
  creado_por
)
VALUES (
  '3b5b3e72-953d-4b54-9a93-42209c1d352d',
  '740e6e80-e8cc-4157-9e3f-237ca3868b46',
  NOW(),
  'bea59fc5-812f-4b71-8228-a50ffc85c2e8',
  'bea59fc5-812f-4b71-8228-a50ffc85c2e8'
)
ON CONFLICT DO NOTHING;

-- 6. Verificar inserción
SELECT * FROM reclutamientos ORDER BY fecha_asignado DESC LIMIT 5;

-- NOTA: Este script deshabilita RLS temporalmente para solucionar el problema
-- de políticas de seguridad. Una vez que el sistema funcione, se pueden recrear
-- las políticas de RLS de manera más simple. 