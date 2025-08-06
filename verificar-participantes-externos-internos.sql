-- ====================================
-- VERIFICAR PARTICIPANTES EXTERNOS E INTERNOS
-- ====================================
-- Problema: Hay dos tipos de participantes
-- Objetivo: Verificar estructura de ambos tipos y sus historiales

-- ====================================
-- 1. VERIFICAR TABLAS DE PARTICIPANTES
-- ====================================

SELECT '=== TABLAS DE PARTICIPANTES ===' as info;

-- Verificar tabla de participantes externos
SELECT 
    'Tabla participantes (externos)' as info,
    COUNT(*) as total_participantes_externos
FROM participantes;

-- Verificar tabla de participantes internos
SELECT 
    'Tabla participantes_internos' as info,
    COUNT(*) as total_participantes_internos
FROM participantes_internos;

-- ====================================
-- 2. VERIFICAR ESTRUCTURA DE TABLAS
-- ====================================

SELECT '=== ESTRUCTURA DE TABLAS ===' as info;

-- Estructura de participantes externos
SELECT 
    'Estructura tabla participantes (externos)' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'participantes'
ORDER BY ordinal_position;

-- Estructura de participantes internos
SELECT 
    'Estructura tabla participantes_internos' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'participantes_internos'
ORDER BY ordinal_position;

-- ====================================
-- 3. VERIFICAR TABLAS DE HISTORIAL
-- ====================================

SELECT '=== TABLAS DE HISTORIAL ===' as info;

-- Verificar todas las tablas de historial
SELECT 
    'Todas las tablas de historial' as info,
    table_name,
    table_type
FROM information_schema.tables
WHERE table_name LIKE 'historial_participacion%'
ORDER BY table_name;

-- ====================================
-- 4. VERIFICAR ESTRUCTURA DE HISTORIALES
-- ====================================

SELECT '=== ESTRUCTURA DE HISTORIALES ===' as info;

-- Estructura de historial para participantes externos
SELECT 
    'Estructura historial_participacion_participantes (externos)' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'historial_participacion_participantes'
ORDER BY ordinal_position;

-- Estructura de historial para participantes internos
SELECT 
    'Estructura historial_participacion_participantes_internos' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'historial_participacion_participantes_internos'
ORDER BY ordinal_position;

-- Estructura de historial para empresas
SELECT 
    'Estructura historial_participacion_empresas' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'historial_participacion_empresas'
ORDER BY ordinal_position;

-- ====================================
-- 5. VERIFICAR DATOS EN HISTORIALES
-- ====================================

SELECT '=== DATOS EN HISTORIALES ===' as info;

-- Datos en historial de participantes externos
SELECT 
    'Datos en historial_participacion_participantes (externos)' as info,
    COUNT(*) as total_registros
FROM historial_participacion_participantes;

-- Datos en historial de participantes internos
SELECT 
    'Datos en historial_participacion_participantes_internos' as info,
    COUNT(*) as total_registros
FROM historial_participacion_participantes_internos;

-- Datos en historial de empresas
SELECT 
    'Datos en historial_participacion_empresas' as info,
    COUNT(*) as total_registros
FROM historial_participacion_empresas;

-- ====================================
-- 6. VERIFICAR RECLUTAMIENTOS
-- ====================================

SELECT '=== RECLUTAMIENTOS ===' as info;

-- Verificar reclutamientos con participantes externos
SELECT 
    'Reclutamientos con participantes externos' as info,
    COUNT(*) as total_reclutamientos
FROM reclutamientos 
WHERE participantes_id IS NOT NULL;

-- Verificar reclutamientos con participantes internos
SELECT 
    'Reclutamientos con participantes internos' as info,
    COUNT(*) as total_reclutamientos
FROM reclutamientos 
WHERE participantes_internos_id IS NOT NULL;

-- Verificar estructura de reclutamientos
SELECT 
    'Estructura tabla reclutamientos' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'reclutamientos'
ORDER BY ordinal_position;

-- ====================================
-- 7. RESUMEN DE ESTRUCTURA
-- ====================================

SELECT '=== RESUMEN DE ESTRUCTURA ===' as info;

-- Resumen de columnas por tabla
SELECT 
    'Columnas en participantes (externos)' as info,
    string_agg(column_name, ', ' ORDER BY ordinal_position) as columnas
FROM information_schema.columns
WHERE table_name = 'participantes';

SELECT 
    'Columnas en participantes_internos' as info,
    string_agg(column_name, ', ' ORDER BY ordinal_position) as columnas
FROM information_schema.columns
WHERE table_name = 'participantes_internos';

SELECT 
    'Columnas en historial_participacion_participantes (externos)' as info,
    string_agg(column_name, ', ' ORDER BY ordinal_position) as columnas
FROM information_schema.columns
WHERE table_name = 'historial_participacion_participantes';

SELECT 
    'Columnas en historial_participacion_participantes_internos' as info,
    string_agg(column_name, ', ' ORDER BY ordinal_position) as columnas
FROM information_schema.columns
WHERE table_name = 'historial_participacion_participantes_internos';

-- ====================================
-- 8. INSTRUCCIONES PARA VISTAS
-- ====================================

SELECT '=== INSTRUCCIONES PARA VISTAS ===' as info;
SELECT '1. Necesitamos crear vistas separadas para externos e internos' as paso1;
SELECT '2. Vista para participantes externos: usar historial_participacion_participantes' as paso2;
SELECT '3. Vista para participantes internos: usar historial_participacion_participantes_internos' as paso3;
SELECT '4. Vista para empresas: usar historial_participacion_empresas' as paso4;
SELECT '5. Verificar que las columnas coincidan en cada tabla' as paso5;

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== VERIFICACIÓN COMPLETADA ===' as info;
SELECT '✅ Ahora sabemos que hay participantes externos e internos' as mensaje;
SELECT '⚠️ Necesitamos crear vistas separadas para cada tipo' as explicacion;
SELECT '🔧 Después crearemos las vistas correctas' as solucion; 