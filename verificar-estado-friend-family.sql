-- =====================================================
-- VERIFICACIÓN DEL ESTADO DE FRIEND AND FAMILY
-- =====================================================

-- 1. VERIFICAR SI EXISTE LA TABLA PRINCIPAL
SELECT 
    'TABLA PRINCIPAL' as tipo,
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'participantes_friend_family'
ORDER BY ordinal_position;

-- 2. VERIFICAR SI EXISTE LA TABLA DE HISTORIAL
SELECT 
    'TABLA HISTORIAL' as tipo,
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'historial_participacion_participantes_friend_family'
ORDER BY ordinal_position;

-- 3. VERIFICAR SI EXISTE LA COLUMNA EN RECLUTAMIENTOS
SELECT 
    'COLUMNA EN RECLUTAMIENTOS' as tipo,
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'reclutamientos' 
AND column_name = 'participantes_friend_family_id';

-- 4. VERIFICAR SI EXISTE EL TRIGGER
SELECT 
    'TRIGGER' as tipo,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_participantes_friend_family_trigger';

-- 5. VERIFICAR SI EXISTE LA FUNCIÓN
SELECT 
    'FUNCIÓN' as tipo,
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name = 'trigger_participantes_friend_family';

-- 6. VERIFICAR SI EXISTE LA VISTA
SELECT 
    'VISTA' as tipo,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'vista_estadisticas_participantes_friend_family';

-- 7. VERIFICAR DATOS EXISTENTES
SELECT 
    'DATOS PARTICIPANTES' as tipo,
    COUNT(*) as total_participantes
FROM participantes_friend_family;

SELECT 
    'DATOS HISTORIAL' as tipo,
    COUNT(*) as total_registros
FROM historial_participacion_participantes_friend_family;

-- 8. VERIFICAR RECLUTAMIENTOS CON FRIEND AND FAMILY
SELECT 
    'RECLUTAMIENTOS FRIEND AND FAMILY' as tipo,
    COUNT(*) as total_reclutamientos
FROM reclutamientos 
WHERE participantes_friend_family_id IS NOT NULL; 