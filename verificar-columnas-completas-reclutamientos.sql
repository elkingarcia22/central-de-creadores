-- ====================================
-- VERIFICAR TODAS LAS COLUMNAS DE RECLUTAMIENTOS
-- ====================================
-- Ejecutar en Supabase SQL Editor

-- 1. Todas las columnas de reclutamientos
SELECT '=== TODAS LAS COLUMNAS DE RECLUTAMIENTOS ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'reclutamientos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar si existen columnas específicas
SELECT '=== VERIFICAR COLUMNAS ESPECÍFICAS ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'reclutamientos' 
AND table_schema = 'public'
AND column_name IN (
    'hora_sesion',
    'duracion_sesion',
    'participantes_id',
    'reclutador_id',
    'estado_agendamiento',
    'fecha_sesion'
)
ORDER BY column_name;
