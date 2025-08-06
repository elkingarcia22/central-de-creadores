-- ====================================
-- VERIFICAR Y ELIMINAR INVESTIGACIONES PROBLEMÁTICAS
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar todas las investigaciones
SELECT 
    id,
    nombre,
    estado,
    creado_el,
    responsable_id
FROM investigaciones 
ORDER BY creado_el DESC;

-- 2. Verificar investigaciones sin nombre o con nombre vacío
SELECT 
    id,
    nombre,
    estado,
    creado_el,
    responsable_id
FROM investigaciones 
WHERE nombre IS NULL OR nombre = '' OR nombre = 'null'
ORDER BY creado_el DESC;

-- 3. Verificar reclutamientos asociados a investigaciones problemáticas
SELECT 
    r.id as reclutamiento_id,
    r.investigacion_id,
    i.nombre as investigacion_nombre,
    i.estado as investigacion_estado
FROM reclutamientos r
LEFT JOIN investigaciones i ON r.investigacion_id = i.id
WHERE i.nombre IS NULL OR i.nombre = '' OR i.nombre = 'null'
ORDER BY r.fecha_asignado DESC;

-- 4. Eliminar reclutamientos asociados a investigaciones problemáticas
DELETE FROM reclutamientos 
WHERE investigacion_id IN (
    SELECT id FROM investigaciones 
    WHERE nombre IS NULL OR nombre = '' OR nombre = 'null'
);

-- 5. Eliminar investigaciones problemáticas
DELETE FROM investigaciones 
WHERE nombre IS NULL OR nombre = '' OR nombre = 'null';

-- 6. Verificar que se eliminaron correctamente
SELECT 
    '✅ Investigaciones restantes:' as status,
    COUNT(*) as total_investigaciones
FROM investigaciones;

-- 7. Verificar reclutamientos restantes
SELECT 
    '✅ Reclutamientos restantes:' as status,
    COUNT(*) as total_reclutamientos
FROM reclutamientos; 