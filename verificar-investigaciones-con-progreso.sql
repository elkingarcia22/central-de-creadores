-- ====================================
-- VERIFICAR INVESTIGACIONES CON PROGRESO
-- ====================================
-- Verificar investigaciones en estado "por_agendar" y su progreso de participantes

-- 1. Verificar investigaciones en estado "por_agendar"
SELECT 
    'Investigaciones por agendar' as tipo,
    id,
    nombre,
    estado,
    creado_el
FROM investigaciones 
WHERE estado = 'por_agendar';

-- 2. Verificar participantes externos por investigación
SELECT 
    'Participantes externos por investigación' as tipo,
    i.nombre as investigacion,
    COUNT(p.id) as total_participantes_externos
FROM investigaciones i
LEFT JOIN participantes p ON i.id = p.investigacion_id
WHERE i.estado = 'por_agendar'
GROUP BY i.id, i.nombre;

-- 3. Verificar participantes internos por investigación
SELECT 
    'Participantes internos por investigación' as tipo,
    i.nombre as investigacion,
    COUNT(pi.id) as total_participantes_internos
FROM investigaciones i
LEFT JOIN participantes_internos pi ON i.id = pi.investigacion_id
WHERE i.estado = 'por_agendar'
GROUP BY i.id, i.nombre;

-- 4. Verificar libretos por investigación
SELECT 
    'Libretos por investigación' as tipo,
    i.nombre as investigacion,
    li.numero_participantes as participantes_requeridos
FROM investigaciones i
LEFT JOIN libretos_investigacion li ON i.id = li.investigacion_id
WHERE i.estado = 'por_agendar';

-- 5. Verificar reclutamientos agendados por investigación
SELECT 
    'Reclutamientos agendados por investigación' as tipo,
    i.nombre as investigacion,
    COUNT(r.id) as total_reclutamientos
FROM investigaciones i
LEFT JOIN reclutamientos r ON i.id = r.investigacion_id
WHERE i.estado = 'por_agendar'
GROUP BY i.id, i.nombre; 