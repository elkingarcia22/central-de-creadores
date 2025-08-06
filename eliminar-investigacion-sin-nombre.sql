-- ====================================
-- ELIMINAR INVESTIGACIÓN SIN NOMBRE
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar investigaciones sin nombre
SELECT 
    id,
    nombre,
    estado,
    creado_el,
    responsable_id
FROM investigaciones 
WHERE nombre IS NULL OR nombre = '';

-- 2. Verificar si hay reclutamientos asociados a esa investigación
SELECT 
    r.id as reclutamiento_id,
    r.investigacion_id,
    i.nombre as investigacion_nombre
FROM reclutamientos r
LEFT JOIN investigaciones i ON r.investigacion_id = i.id
WHERE i.nombre IS NULL OR i.nombre = '';

-- 3. Eliminar reclutamientos asociados a investigaciones sin nombre (si existen)
DELETE FROM reclutamientos 
WHERE investigacion_id IN (
    SELECT id FROM investigaciones 
    WHERE nombre IS NULL OR nombre = ''
);

-- 4. Eliminar la investigación sin nombre
DELETE FROM investigaciones 
WHERE nombre IS NULL OR nombre = '';

-- 5. Verificar que se eliminó correctamente
SELECT 
    '✅ Investigaciones restantes:' as status,
    COUNT(*) as total_investigaciones
FROM investigaciones; 