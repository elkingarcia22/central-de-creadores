-- ====================================
-- ELIMINAR RECLUTAMIENTO PROBLEMÁTICO
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar el reclutamiento problemático
SELECT 
    r.id as reclutamiento_id,
    r.investigacion_id,
    i.nombre as investigacion_nombre,
    p.nombre as participante_nombre,
    r.fecha_asignado
FROM reclutamientos r
LEFT JOIN investigaciones i ON r.investigacion_id = i.id
LEFT JOIN participantes p ON r.participantes_id = p.id
WHERE r.id = '5926d473-b5b3-4790-a0c4-188ce1b293a9';

-- 2. Eliminar el reclutamiento problemático
DELETE FROM reclutamientos 
WHERE id = '5926d473-b5b3-4790-a0c4-188ce1b293a9';

-- 3. Verificar que se eliminó correctamente
SELECT 
    '✅ Reclutamientos restantes:' as status,
    COUNT(*) as total_reclutamientos
FROM reclutamientos;

-- 4. Verificar la vista actualizada
SELECT 
    reclutamiento_id,
    investigacion_id,
    investigacion_nombre,
    participante_nombre,
    estado_reclutamiento_nombre,
    fecha_asignado
FROM vista_reclutamientos_completa
ORDER BY fecha_asignado DESC; 