-- ====================================
-- VERIFICAR SOLUCIÓN SIN TRIGGERS
-- ====================================
-- Objetivo: Verificar que la solución sin triggers está funcionando
-- y que las estadísticas son correctas

-- ====================================
-- 1. VERIFICAR QUE NO HAY TRIGGERS
-- ====================================

SELECT '=== VERIFICANDO QUE NO HAY TRIGGERS ===' as info;

-- Verificar que no hay triggers activos
SELECT 
    'Triggers activos en reclutamientos' as info,
    COUNT(*) as cantidad
FROM information_schema.triggers
WHERE event_object_table = 'reclutamientos';

-- Verificar que no hay funciones relacionadas
SELECT 
    'Funciones relacionadas con historial' as info,
    COUNT(*) as cantidad
FROM information_schema.routines
WHERE routine_name LIKE '%historial%'
OR routine_name LIKE '%participante%'
OR routine_name LIKE '%empresa%';

-- ====================================
-- 2. VERIFICAR ESTADO ACTUAL
-- ====================================

SELECT '=== VERIFICANDO ESTADO ACTUAL ===' as info;

-- Verificar reclutamientos finalizados
SELECT 
    'Reclutamientos finalizados' as info,
    COUNT(*) as total_finalizados
FROM reclutamientos 
WHERE participantes_id IS NOT NULL
AND estado_agendamiento = (
    SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
);

-- Verificar historial actual
SELECT 
    'Estado del historial' as info,
    (SELECT COUNT(*) FROM historial_participacion_participantes) as historial_participantes,
    (SELECT COUNT(*) FROM historial_participacion_empresas) as historial_empresas;

-- ====================================
-- 3. VERIFICAR VISTAS CREADAS
-- ====================================

SELECT '=== VERIFICANDO VISTAS CREADAS ===' as info;

-- Verificar que las vistas existen
SELECT 
    'Vistas creadas' as info,
    table_name
FROM information_schema.views
WHERE table_name IN ('vista_estadisticas_participantes', 'vista_estadisticas_empresas')
ORDER BY table_name;

-- ====================================
-- 4. VERIFICAR FUNCIÓN MANUAL
-- ====================================

SELECT '=== VERIFICANDO FUNCIÓN MANUAL ===' as info;

-- Verificar que la función existe
SELECT 
    'Función manual creada' as info,
    routine_name
FROM information_schema.routines
WHERE routine_name = 'actualizar_estadisticas_manual';

-- ====================================
-- 5. PROBAR LAS VISTAS
-- ====================================

SELECT '=== PROBANDO LAS VISTAS ===' as info;

-- Probar vista de participantes
SELECT 
    'Vista estadísticas participantes' as info,
    COUNT(*) as total_participantes
FROM vista_estadisticas_participantes;

-- Probar vista de empresas
SELECT 
    'Vista estadísticas empresas' as info,
    COUNT(*) as total_empresas
FROM vista_estadisticas_empresas;

-- ====================================
-- 6. COMPARAR ESTADÍSTICAS
-- ====================================

SELECT '=== COMPARANDO ESTADÍSTICAS ===' as info;

-- Comparar historial vs vista participantes
SELECT 
    'Comparación participantes' as info,
    (SELECT COUNT(*) FROM historial_participacion_participantes) as historial_participantes,
    (SELECT SUM(participaciones_finalizadas) FROM vista_estadisticas_participantes) as vista_participantes;

-- Comparar historial vs vista empresas
SELECT 
    'Comparación empresas' as info,
    (SELECT COUNT(*) FROM historial_participacion_empresas) as historial_empresas,
    (SELECT SUM(participaciones_finalizadas) FROM vista_estadisticas_empresas) as vista_empresas;

-- ====================================
-- 7. VERIFICAR CORRESPONDENCIA EXACTA
-- ====================================

SELECT '=== VERIFICANDO CORRESPONDENCIA EXACTA ===' as info;

-- Verificar que el número de reclutamientos finalizados coincide con el historial
SELECT 
    'Correspondencia finalizados vs historial' as info,
    (SELECT COUNT(*) FROM reclutamientos WHERE participantes_id IS NOT NULL AND estado_agendamiento = (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado')) as reclutamientos_finalizados,
    (SELECT COUNT(*) FROM historial_participacion_participantes) as en_historial_participantes,
    (SELECT COUNT(*) FROM historial_participacion_empresas) as en_historial_empresas;

-- ====================================
-- 8. INSTRUCCIONES PARA PRUEBA MANUAL
-- ====================================

SELECT '=== INSTRUCCIONES PARA PRUEBA MANUAL ===' as info;
SELECT '1. Ve a la aplicación y verifica las estadísticas actuales' as paso1;
SELECT '2. Crea una nueva participación y cambia su estado a "Finalizado"' as paso2;
SELECT '3. Verifica que las estadísticas NO se actualicen automáticamente' as paso3;
SELECT '4. Ejecuta: SELECT actualizar_estadisticas_manual();' as paso4;
SELECT '5. Verifica que las estadísticas se actualicen correctamente' as paso5;

-- ====================================
-- 9. COMANDOS ÚTILES PARA EL FUTURO
-- ====================================

SELECT '=== COMANDOS ÚTILES PARA EL FUTURO ===' as info;
SELECT 'Para actualizar estadísticas: SELECT actualizar_estadisticas_manual();' as comando1;
SELECT 'Para ver estadísticas participantes: SELECT * FROM vista_estadisticas_participantes;' as comando2;
SELECT 'Para ver estadísticas empresas: SELECT * FROM vista_estadisticas_empresas;' as comando3;
SELECT 'Para ver historial participantes: SELECT * FROM historial_participacion_participantes;' as comando4;
SELECT 'Para ver historial empresas: SELECT * FROM historial_participacion_empresas;' as comando5;

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== VERIFICACIÓN COMPLETADA ===' as info;
SELECT 'Si no hay triggers activos, la solución está funcionando.' as mensaje;
SELECT 'Las estadísticas ahora se manejan manualmente sin conflictos.' as explicacion;
SELECT 'Para actualizar: SELECT actualizar_estadisticas_manual();' as instruccion_final; 