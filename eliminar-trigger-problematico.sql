-- ====================================
-- ELIMINAR TRIGGER PROBLEMÁTICO
-- ====================================
-- Este trigger está causando que los estados de reclutamiento
-- cambien automáticamente sin control

-- 1. ELIMINAR EL TRIGGER PROBLEMÁTICO
DROP TRIGGER IF EXISTS trigger_actualizar_estado_reclutamiento ON reclutamientos;

-- 2. ELIMINAR LA FUNCIÓN ASOCIADA
DROP FUNCTION IF EXISTS actualizar_estado_reclutamiento_automatico() CASCADE;

-- 3. VERIFICAR QUE SE ELIMINÓ
SELECT 
    '=== VERIFICANDO TRIGGERS RESTANTES ===' as info;

SELECT 
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers 
WHERE event_object_table = 'reclutamientos';

-- 4. VERIFICAR ESTADO ACTUAL DE RECLUTAMIENTOS
SELECT 
    '=== ESTADO ACTUAL DE RECLUTAMIENTOS ===' as info;

SELECT 
    r.id,
    r.investigacion_id,
    r.fecha_sesion,
    r.duracion_sesion,
    r.estado_agendamiento,
    eac.nombre as estado_nombre,
    r.participantes_id,
    r.participantes_internos_id,
    r.participantes_friend_family_id
FROM reclutamientos r
LEFT JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
ORDER BY r.fecha_sesion DESC;

-- 5. COMENTARIO IMPORTANTE
SELECT 
    '=== IMPORTANTE ===' as info,
    'El trigger problemático ha sido eliminado.' as mensaje,
    'Los estados ahora solo se actualizarán manualmente o a través de la API.' as explicacion; 