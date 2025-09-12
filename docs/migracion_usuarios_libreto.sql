-- ====================================
-- MIGRACIÓN: AGREGAR CAMPO usuarios_libreto A TABLA reclutamientos
-- ====================================
-- 
-- Este script agrega el campo usuarios_libreto a la tabla reclutamientos
-- para soportar la sincronización bidireccional entre libreto y sesiones.
--
-- Ejecutar este script en el SQL Editor de Supabase

-- 1. Agregar el campo usuarios_libreto como JSONB
ALTER TABLE reclutamientos 
ADD COLUMN usuarios_libreto JSONB DEFAULT NULL;

-- 2. Agregar comentario descriptivo
COMMENT ON COLUMN reclutamientos.usuarios_libreto IS 'Array de UUIDs de usuarios del equipo configurados en el libreto para esta sesión';

-- 3. Crear índice GIN para mejorar consultas JSONB
CREATE INDEX IF NOT EXISTS idx_reclutamientos_usuarios_libreto 
ON reclutamientos USING GIN (usuarios_libreto);

-- 4. Verificar que el campo se agregó correctamente
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'reclutamientos' 
AND column_name = 'usuarios_libreto';

-- 5. Verificar que el índice se creó
SELECT 
    indexname, 
    indexdef
FROM pg_indexes 
WHERE tablename = 'reclutamientos' 
AND indexname = 'idx_reclutamientos_usuarios_libreto';
