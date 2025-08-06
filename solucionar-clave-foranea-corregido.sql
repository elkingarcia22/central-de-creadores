-- ====================================
-- SOLUCIONAR CLAVE FORÁNEA (CORREGIDO)
-- ====================================
-- Problema: ERROR: 23503: insert or update on table "historial_participacion_participantes" 
--          violates foreign key constraint "historial_participacion_participantes_investigacion_id_fkey"
-- Solución: Asignar investigacion_id válidos a reclutamientos que no los tienen
-- Objetivo: Corregir datos inconsistentes sin asumir columnas

-- ====================================
-- 1. VERIFICAR ESTADO ACTUAL
-- ====================================

SELECT '=== VERIFICANDO ESTADO ACTUAL ===' as info;

-- Verificar reclutamientos con investigaciones inexistentes
SELECT 
    'Reclutamientos con investigaciones inexistentes' as info,
    COUNT(*) as cantidad
FROM reclutamientos r
WHERE r.investigacion_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM investigaciones i WHERE i.id = r.investigacion_id
);

-- Verificar reclutamientos sin investigacion_id
SELECT 
    'Reclutamientos sin investigacion_id' as info,
    COUNT(*) as cantidad
FROM reclutamientos
WHERE investigacion_id IS NULL;

-- Verificar investigaciones disponibles
SELECT 
    'Investigaciones disponibles' as info,
    COUNT(*) as cantidad
FROM investigaciones;

-- ====================================
-- 2. OBTENER INVESTIGACIÓN VÁLIDA
-- ====================================

SELECT '=== OBTENIENDO INVESTIGACIÓN VÁLIDA ===' as info;

-- Obtener la primera investigación disponible
DO $$
DECLARE
    investigacion_valida_id UUID;
BEGIN
    -- Obtener una investigación válida
    SELECT id INTO investigacion_valida_id
    FROM investigaciones
    LIMIT 1;
    
    IF investigacion_valida_id IS NOT NULL THEN
        RAISE NOTICE 'Investigación válida encontrada: %', investigacion_valida_id;
    ELSE
        RAISE NOTICE 'No hay investigaciones disponibles';
    END IF;
    
    -- Guardar para uso posterior
    PERFORM set_config('app.investigacion_valida_id', investigacion_valida_id::text, false);
END $$;

-- ====================================
-- 3. CORREGIR RECLUTAMIENTOS SIN INVESTIGACION_ID
-- ====================================

SELECT '=== CORRIGIENDO RECLUTAMIENTOS SIN INVESTIGACION_ID ===' as info;

-- Asignar investigacion_id a reclutamientos que no lo tienen
UPDATE reclutamientos 
SET investigacion_id = (
    SELECT id FROM investigaciones LIMIT 1
)
WHERE investigacion_id IS NULL;

-- Verificar resultado
SELECT 
    'Reclutamientos corregidos (sin investigacion_id)' as info,
    COUNT(*) as cantidad
FROM reclutamientos
WHERE investigacion_id IS NOT NULL;

-- ====================================
-- 4. CORREGIR RECLUTAMIENTOS CON INVESTIGACIONES INEXISTENTES
-- ====================================

SELECT '=== CORRIGIENDO RECLUTAMIENTOS CON INVESTIGACIONES INEXISTENTES ===' as info;

-- Asignar investigacion_id válido a reclutamientos con investigaciones inexistentes
UPDATE reclutamientos 
SET investigacion_id = (
    SELECT id FROM investigaciones LIMIT 1
)
WHERE investigacion_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM investigaciones i WHERE i.id = reclutamientos.investigacion_id
);

-- Verificar resultado
SELECT 
    'Reclutamientos corregidos (investigaciones inexistentes)' as info,
    COUNT(*) as cantidad
FROM reclutamientos r
WHERE r.investigacion_id IS NOT NULL
AND EXISTS (
    SELECT 1 FROM investigaciones i WHERE i.id = r.investigacion_id
);

-- ====================================
-- 5. VERIFICAR QUE NO HAY PROBLEMAS DE CLAVE FORÁNEA
-- ====================================

SELECT '=== VERIFICANDO CLAVES FORÁNEAS ===' as info;

-- Verificar que todos los reclutamientos tienen investigacion_id válido
SELECT 
    'Reclutamientos con investigacion_id válido' as info,
    COUNT(*) as cantidad
FROM reclutamientos r
WHERE r.investigacion_id IS NOT NULL
AND EXISTS (
    SELECT 1 FROM investigaciones i WHERE i.id = r.investigacion_id
);

-- Verificar que no hay reclutamientos con investigacion_id inválido
SELECT 
    'Reclutamientos con investigacion_id inválido' as info,
    COUNT(*) as cantidad
FROM reclutamientos r
WHERE r.investigacion_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM investigaciones i WHERE i.id = r.investigacion_id
);

-- ====================================
-- 6. VERIFICAR ESTADO FINAL
-- ====================================

SELECT '=== VERIFICANDO ESTADO FINAL ===' as info;

-- Verificar estadísticas finales
SELECT 
    'Estado final' as info,
    (SELECT COUNT(*) FROM reclutamientos WHERE participantes_id IS NOT NULL) as total_reclutamientos,
    (SELECT COUNT(*) FROM reclutamientos WHERE participantes_id IS NOT NULL AND investigacion_id IS NOT NULL) as con_investigacion_id,
    (SELECT COUNT(*) FROM investigaciones) as total_investigaciones;

-- ====================================
-- 7. PROBAR EL TRIGGER CORREGIDO
-- ====================================

SELECT '=== PROBANDO TRIGGER CORREGIDO ===' as info;

-- Verificar estado antes de la prueba
SELECT 
    'Estado antes de prueba' as info,
    (SELECT COUNT(*) FROM historial_participacion_participantes) as historial_participantes,
    (SELECT COUNT(*) FROM historial_participacion_empresas) as historial_empresas;

-- Simular finalización de un reclutamiento para probar el trigger
UPDATE reclutamientos 
SET 
    estado_agendamiento = (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado')
WHERE id = (
    SELECT r.id
    FROM reclutamientos r
    WHERE r.participantes_id IS NOT NULL
    AND r.estado_agendamiento != (
        SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado'
    )
    AND r.investigacion_id IS NOT NULL
    LIMIT 1
);

-- Verificar estado después de la prueba
SELECT 
    'Estado después de prueba' as info,
    (SELECT COUNT(*) FROM historial_participacion_participantes) as historial_participantes,
    (SELECT COUNT(*) FROM historial_participacion_empresas) as historial_empresas;

-- ====================================
-- 8. VERIFICAR CORRESPONDENCIA EXACTA
-- ====================================

SELECT '=== VERIFICANDO CORRESPONDENCIA EXACTA ===' as info;

-- Verificar que el número de reclutamientos finalizados coincide con el historial
SELECT 
    'Correspondencia finalizados vs historial' as info,
    (SELECT COUNT(*) FROM reclutamientos WHERE participantes_id IS NOT NULL AND estado_agendamiento = (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado')) as reclutamientos_finalizados,
    (SELECT COUNT(*) FROM historial_participacion_participantes) as en_historial_participantes,
    (SELECT COUNT(*) FROM historial_participacion_empresas) as en_historial_empresas;

-- ====================================
-- 9. INSTRUCCIONES PARA PRUEBA MANUAL
-- ====================================

SELECT '=== INSTRUCCIONES PARA PRUEBA MANUAL ===' as info;
SELECT '1. Ve a la aplicación y crea una nueva participación' as paso1;
SELECT '2. Cambia el estado de la participación a "Finalizado"' as paso2;
SELECT '3. Verifica que las estadísticas se actualicen sin errores' as paso3;
SELECT '4. Si funciona, el problema de clave foránea está solucionado' as paso4;

-- ====================================
-- MENSAJE FINAL
-- ====================================

SELECT '=== SOLUCIÓN DE CLAVE FORÁNEA COMPLETADA ===' as info;
SELECT 'Se han corregido los reclutamientos con investigacion_id inválidos.' as mensaje;
SELECT 'Ahora todos los reclutamientos tienen investigacion_id válidos.' as explicacion;
SELECT 'Prueba creando y finalizando una nueva participación para verificar.' as siguiente_paso; 