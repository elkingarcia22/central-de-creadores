-- ====================================
-- VERIFICAR INVESTIGACIONES SIMPLIFICADO
-- ====================================
-- Verificar investigaciones en estado "por_agendar" y su progreso

-- 1. Verificar investigaciones en estado "por_agendar"
SELECT 
    'Investigaciones por agendar' as tipo,
    id,
    nombre,
    estado,
    creado_el
FROM investigaciones 
WHERE estado = 'por_agendar';

-- 2. Verificar libretos por investigación
SELECT 
    'Libretos por investigación' as tipo,
    i.nombre as investigacion,
    li.numero_participantes as participantes_requeridos
FROM investigaciones i
LEFT JOIN libretos_investigacion li ON i.id = li.investigacion_id
WHERE i.estado = 'por_agendar';

-- 3. Verificar reclutamientos agendados por investigación
SELECT 
    'Reclutamientos agendados por investigación' as tipo,
    i.nombre as investigacion,
    COUNT(r.id) as total_reclutamientos
FROM investigaciones i
LEFT JOIN reclutamientos r ON i.id = r.investigacion_id
WHERE i.estado = 'por_agendar'
GROUP BY i.id, i.nombre;

-- 4. Verificar participantes únicos por investigación (a través de reclutamientos)
SELECT 
    'Participantes únicos por investigación' as tipo,
    i.nombre as investigacion,
    COUNT(DISTINCT r.participantes_id) as total_participantes_unicos
FROM investigaciones i
LEFT JOIN reclutamientos r ON i.id = r.investigacion_id
WHERE i.estado = 'por_agendar'
GROUP BY i.id, i.nombre; 