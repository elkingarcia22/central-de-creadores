-- ====================================
-- VERIFICAR SI EXISTE EL CAMPO DURACIÓN
-- ====================================

-- 1. VERIFICAR ESTRUCTURA ACTUAL DE LA TABLA
SELECT '=== ESTRUCTURA ACTUAL DE RECLUTAMIENTOS ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'reclutamientos'
ORDER BY ordinal_position;

-- 2. VERIFICAR SI EXISTE EL CAMPO DURACIÓN
SELECT '=== VERIFICANDO CAMPO DURACIÓN ===' as info;
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'reclutamientos' 
            AND column_name = 'duracion_sesion'
        ) THEN '✅ El campo duracion_sesion EXISTE'
        ELSE '❌ El campo duracion_sesion NO EXISTE'
    END as estado_campo;

-- 3. SI NO EXISTE, AGREGARLO
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'reclutamientos' 
        AND column_name = 'duracion_sesion'
    ) THEN
        ALTER TABLE reclutamientos ADD COLUMN duracion_sesion INTEGER DEFAULT 60;
        RAISE NOTICE '✅ Campo duracion_sesion agregado exitosamente';
        
        -- Actualizar registros existentes
        UPDATE reclutamientos SET duracion_sesion = 60 WHERE duracion_sesion IS NULL;
        RAISE NOTICE '✅ Registros existentes actualizados con duración por defecto';
    ELSE
        RAISE NOTICE 'ℹ️ El campo duracion_sesion ya existe';
    END IF;
END $$;

-- 4. VERIFICAR RESULTADO FINAL
SELECT '=== VERIFICACIÓN FINAL ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'reclutamientos' 
AND column_name = 'duracion_sesion';

-- 5. MOSTRAR ALGUNOS DATOS DE PRUEBA
SELECT '=== DATOS DE PRUEBA ===' as info;
SELECT 
    id,
    fecha_sesion,
    duracion_sesion,
    fecha_sesion + (duracion_sesion || ' minutes')::INTERVAL as fecha_fin_sesion
FROM reclutamientos 
ORDER BY fecha_sesion DESC 
LIMIT 5; 