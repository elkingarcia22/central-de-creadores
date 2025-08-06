-- Crear tabla historial_participacion_participantes_internos

-- 1. CREAR TABLA SI NO EXISTE
CREATE TABLE IF NOT EXISTS historial_participacion_participantes_internos (
    id SERIAL PRIMARY KEY,
    participante_interno_id UUID NOT NULL,
    investigacion_id UUID NOT NULL,
    estado_sesion VARCHAR(50) DEFAULT 'pendiente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. VERIFICAR ESTRUCTURA CREADA
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'historial_participacion_participantes_internos'
ORDER BY ordinal_position;

-- 3. VERIFICAR QUE LA TABLA ESTÁ VACÍA
SELECT 
    'TABLA VACÍA' as fuente,
    COUNT(*) as total_registros
FROM historial_participacion_participantes_internos; 