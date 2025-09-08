-- ====================================
-- VERIFICAR ESTRUCTURA DE TABLA RECLUTAMIENTOS
-- ====================================

-- Verificar estructura de la tabla reclutamientos
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'reclutamientos'
ORDER BY ordinal_position;

-- Verificar si hay datos en la tabla
SELECT COUNT(*) as total_reclutamientos FROM reclutamientos;

-- Verificar algunos registros de ejemplo
SELECT 
    id,
    titulo,
    descripcion,
    fecha_programada,
    duracion_minutos,
    ubicacion,
    sala,
    creado_por,
    created_at
FROM reclutamientos 
LIMIT 5;

-- Verificar si hay relación con investigaciones
SELECT 
    r.id,
    r.titulo,
    r.investigacion_id,
    i.nombre as investigacion_nombre
FROM reclutamientos r
LEFT JOIN investigaciones i ON r.investigacion_id = i.id
LIMIT 5;
