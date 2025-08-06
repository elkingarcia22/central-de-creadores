-- ====================================
-- VERIFICAR PARTICIPANTE DEL RECLUTAMIENTO
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar el reclutamiento específico
SELECT 
    r.id as reclutamiento_id,
    r.participantes_id,
    r.investigacion_id,
    r.fecha_asignado,
    p.nombre as participante_nombre,
    p.descripción as participante_descripcion,
    p.doleres_necesidades,
    p.rol_empresa_id,
    p.kam_id,
    p.empresa_id,
    p.total_participaciones,
    p.fecha_ultima_participacion
FROM reclutamientos r
LEFT JOIN participantes p ON r.participantes_id = p.id
WHERE r.id = '06d1e93c-0b80-44c8-b105-507792c4f041';

-- 2. Verificar todos los reclutamientos de la misma investigación
SELECT 
    r.id as reclutamiento_id,
    r.participantes_id,
    p.nombre as participante_nombre,
    p.descripción as participante_descripcion,
    p.doleres_necesidades,
    p.rol_empresa_id,
    p.kam_id,
    p.empresa_id,
    p.total_participaciones
FROM reclutamientos r
LEFT JOIN participantes p ON r.participantes_id = p.id
WHERE r.investigacion_id = (
    SELECT investigacion_id 
    FROM reclutamientos 
    WHERE id = '06d1e93c-0b80-44c8-b105-507792c4f041'
);

-- 3. Verificar si el participante existe en la tabla participantes
SELECT 
    id,
    nombre,
    descripción,
    doleres_necesidades,
    rol_empresa_id,
    kam_id,
    empresa_id,
    total_participaciones,
    fecha_ultima_participacion
FROM participantes 
WHERE id = (
    SELECT participantes_id 
    FROM reclutamientos 
    WHERE id = '06d1e93c-0b80-44c8-b105-507792c4f041'
);

-- 4. Verificar estructura de la tabla reclutamientos
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'reclutamientos'
ORDER BY ordinal_position; 