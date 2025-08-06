-- Script para agregar campo email a la tabla participantes
-- Ejecutar en Supabase SQL Editor

-- 1. Agregar el campo email
ALTER TABLE participantes 
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- 2. Agregar comentario al campo
COMMENT ON COLUMN participantes.email IS 'Email del participante';

-- 3. Crear índice para búsquedas por email
CREATE INDEX IF NOT EXISTS idx_participantes_email ON participantes(email);

-- 4. Verificar que el campo se agregó correctamente
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'participantes' 
AND column_name = 'email';

-- 5. Mostrar la estructura actualizada de la tabla
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'participantes' 
ORDER BY ordinal_position; 