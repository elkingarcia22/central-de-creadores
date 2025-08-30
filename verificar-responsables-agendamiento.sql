-- ====================================
-- VERIFICAR RESPONSABLES DE AGENDAMIENTO
-- ====================================

-- 1. Verificar estructura de la tabla usuarios
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'usuarios'
ORDER BY ordinal_position;

-- 2. Verificar si hay reclutamientos con responsables asignados
SELECT 
    'Reclutamientos con responsables' as info,
    COUNT(*) as total
FROM reclutamientos 
WHERE responsable_agendamiento IS NOT NULL;

-- 3. Ver algunos ejemplos de reclutamientos con responsables
SELECT 
    r.id as reclutamiento_id,
    r.investigacion_id,
    r.participantes_id,
    r.responsable_agendamiento,
    u.*
FROM reclutamientos r
LEFT JOIN usuarios u ON r.responsable_agendamiento = u.id
WHERE r.responsable_agendamiento IS NOT NULL
LIMIT 5;

-- 4. Verificar usuarios disponibles
SELECT 
    'Usuarios disponibles' as info,
    COUNT(*) as total_usuarios
FROM usuarios;

-- 5. Ver algunos usuarios de ejemplo
SELECT 
    *
FROM usuarios 
LIMIT 5;

-- 6. Verificar reclutamientos del participante específico
SELECT 
    'Reclutamientos del participante 9155b800-f786-46d7-9294-bb385434d042' as info,
    r.id as reclutamiento_id,
    r.investigacion_id,
    r.responsable_agendamiento,
    u.*
FROM reclutamientos r
LEFT JOIN usuarios u ON r.responsable_agendamiento = u.id
WHERE r.participantes_id = '9155b800-f786-46d7-9294-bb385434d042';
