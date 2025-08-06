-- ====================================
-- VERIFICAR VISTA PRINCIPAL DE RECLUTAMIENTO
-- ====================================
-- Esta vista debe mostrar SOLO investigaciones en estado "por_agendar"
-- NO debe mostrar reclutamientos individuales

-- 1. Verificar la definición actual de la vista
SELECT 
    'Definición de vista_reclutamientos' as tipo,
    view_definition
FROM information_schema.views 
WHERE table_name = 'vista_reclutamientos';

-- 2. Verificar qué datos muestra actualmente la vista
SELECT 
    'Datos en vista_reclutamientos' as tipo,
    id,
    investigacion_id,
    nombre_investigacion,
    estado_investigacion,
    progreso_participantes,
    tipo_reclutamiento,
    estado_reclutamiento
FROM vista_reclutamientos;

-- 3. Verificar que solo hay investigaciones en estado "por_agendar"
SELECT 
    'Investigaciones por agendar' as tipo,
    COUNT(*) as total
FROM investigaciones 
WHERE estado = 'por_agendar';

-- 4. Verificar que la vista coincide con las investigaciones por agendar
SELECT 
    'Coincidencia vista vs investigaciones' as tipo,
    COUNT(*) as total_vista,
    (SELECT COUNT(*) FROM investigaciones WHERE estado = 'por_agendar') as total_investigaciones
FROM vista_reclutamientos; 