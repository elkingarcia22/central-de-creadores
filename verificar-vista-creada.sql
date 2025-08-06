-- ====================================
-- VERIFICAR VISTA CREADA
-- ====================================

-- Verificar si la vista existe
SELECT 
    'Vista existe' as tipo,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'vista_reclutamientos'
AND table_schema = 'public';

-- Verificar los datos de la vista
SELECT 
    'Datos de la vista' as tipo,
    id,
    nombre_investigacion,
    estado_investigacion,
    participantes_actuales,
    participantes_requeridos,
    progreso_participantes,
    porcentaje_avance
FROM vista_reclutamientos;

-- Verificar la definición de la vista
SELECT 
    'Definición de la vista' as tipo,
    view_definition
FROM information_schema.views 
WHERE table_name = 'vista_reclutamientos'
AND table_schema = 'public'; 

-- Verificar que la vista funciona
SELECT COUNT(*) as total_investigaciones_pendientes
FROM vista_reclutamientos;

-- Ver datos de la vista
SELECT id, nombre, estado_reclutamiento, progreso_reclutamiento
FROM vista_reclutamientos
LIMIT 5; 