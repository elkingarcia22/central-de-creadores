-- ====================================
-- VERIFICACIÓN Y ACTUALIZACIÓN DE ESTRUCTURA
-- ====================================

-- 1. VERIFICAR QUE LA TABLA reclutamientos TIENE EL CAMPO responsable_agendamiento
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'reclutamientos' 
  AND column_name = 'responsable_agendamiento';

-- 2. SI NO EXISTE, CREAR EL CAMPO responsable_agendamiento
-- ALTER TABLE reclutamientos 
-- ADD COLUMN responsable_agendamiento UUID REFERENCES auth.users(id);

-- 3. VERIFICAR ÍNDICES PARA OPTIMIZAR CONSULTAS
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'reclutamientos' 
  AND indexdef LIKE '%responsable_agendamiento%';

-- 4. CREAR ÍNDICE SI NO EXISTE (para optimizar filtros por agendador)
-- CREATE INDEX IF NOT EXISTS idx_reclutamientos_responsable_agendamiento 
-- ON reclutamientos(responsable_agendamiento);

-- 5. VERIFICAR POLÍTICAS RLS (Row Level Security) PARA EL ROL AGENDADOR
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'reclutamientos';

-- 6. CREAR POLÍTICA RLS PARA AGENDADORES (si es necesario)
-- CREATE POLICY "agendadores_pueden_ver_sus_reclutamientos" ON reclutamientos
-- FOR SELECT
-- TO authenticated
-- USING (
--   EXISTS (
--     SELECT 1 FROM user_roles ur
--     JOIN roles_plataforma rp ON ur.role_id = rp.id
--     WHERE ur.user_id = auth.uid()
--       AND rp.nombre = 'Agendador'
--       AND reclutamientos.responsable_agendamiento = auth.uid()
--   )
-- );
