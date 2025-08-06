-- ====================================
-- VERIFICAR PARTICIPANTE ESPECÍFICO
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar el participante específico del reclutamiento
SELECT 
    p.id,
    p.nombre,
    p."descripción",
    p.doleres_necesidades,
    p.rol_empresa_id,
    p.kam_id,
    p.empresa_id,
    p.total_participaciones,
    p.fecha_ultima_participacion,
    p.created_at,
    p.updated_at,
    p.creado_por,
    p.productos_relacionados,
    p.estado_participante
FROM participantes p
WHERE p.id = 'bdcf99c2-4022-44b8-8c16-2e115b6c1245';

-- 2. Verificar el reclutamiento específico
SELECT 
    r.id as reclutamiento_id,
    r.participantes_id,
    r.investigacion_id,
    r.fecha_asignado,
    r.estado_agendamiento,
    r.reclutador_id,
    r.creado_por
FROM reclutamientos r
WHERE r.id = '06d1e93c-0b80-44c8-b105-507792c4f041';

-- 3. Verificar datos desde la vista
SELECT 
    reclutamiento_id,
    participantes_id,
    investigacion_id,
    participante_nombre,
    estado_reclutamiento_nombre,
    estado_reclutamiento_color,
    orden_estado,
    fecha_asignado
FROM vista_reclutamientos_completa
WHERE reclutamiento_id = '06d1e93c-0b80-44c8-b105-507792c4f041';

-- 4. Verificar si hay más reclutamientos de la misma investigación
SELECT 
    reclutamiento_id,
    participantes_id,
    participante_nombre,
    estado_reclutamiento_nombre,
    fecha_asignado
FROM vista_reclutamientos_completa
WHERE investigacion_id = 'fe3c824a-1415-48df-abae-8a4b2f8717dd'
ORDER BY fecha_asignado DESC; 