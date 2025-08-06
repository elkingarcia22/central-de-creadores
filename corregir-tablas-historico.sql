-- ====================================
-- CORREGIR TABLAS DE HISTORIAL
-- ====================================
-- Remover campos innecesarios de las tablas de historial

-- 1. Corregir tabla historial_participacion_empresas
ALTER TABLE historial_participacion_empresas 
DROP COLUMN IF EXISTS satisfaccion_participante,
DROP COLUMN IF EXISTS calidad_feedback,
DROP COLUMN IF EXISTS insights_obtenidos,
DROP COLUMN IF EXISTS seguimiento_requerido,
DROP COLUMN IF EXISTS fecha_seguimiento,
DROP COLUMN IF EXISTS notas_seguimiento,
DROP COLUMN IF EXISTS rol_participante,
DROP COLUMN IF EXISTS departamento_participante,
DROP COLUMN IF EXISTS tipo_investigacion,
DROP COLUMN IF EXISTS producto_evaluado;

-- 2. Corregir tabla historial_participacion_participantes
ALTER TABLE historial_participacion_participantes 
DROP COLUMN IF EXISTS satisfaccion_participante,
DROP COLUMN IF EXISTS calidad_feedback,
DROP COLUMN IF EXISTS insights_obtenidos,
DROP COLUMN IF EXISTS seguimiento_requerido,
DROP COLUMN IF EXISTS fecha_seguimiento,
DROP COLUMN IF EXISTS notas_seguimiento,
DROP COLUMN IF EXISTS rol_participante,
DROP COLUMN IF EXISTS departamento_participante,
DROP COLUMN IF EXISTS tipo_investigacion,
DROP COLUMN IF EXISTS producto_evaluado;

-- 3. Verificar estructura corregida de historial_participacion_empresas
SELECT 
    'Estructura corregida de historial_participacion_empresas:' as info;
    
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'historial_participacion_empresas'
ORDER BY ordinal_position;

-- 4. Verificar estructura corregida de historial_participacion_participantes
SELECT 
    'Estructura corregida de historial_participacion_participantes:' as info;
    
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'historial_participacion_participantes'
ORDER BY ordinal_position;

-- 5. Verificar datos existentes
SELECT 
    'Datos en historial_participacion_empresas:' as info,
    COUNT(*) as total_registros
FROM historial_participacion_empresas;

SELECT 
    'Datos en historial_participacion_participantes:' as info,
    COUNT(*) as total_registros
FROM historial_participacion_participantes; 