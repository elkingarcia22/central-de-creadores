-- ====================================
-- VERIFICAR VISTA RECLUTAMIENTOS
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar qué datos hay en la vista de reclutamientos
SELECT 
    reclutamiento_id,
    participantes_id,
    investigacion_id,
    participante_nombre,
    estado_reclutamiento_nombre,
    fecha_asignado
FROM vista_reclutamientos_completa
ORDER BY fecha_asignado DESC
LIMIT 10;

-- 2. Verificar cuántos registros hay en la vista
SELECT COUNT(*) as total_en_vista FROM vista_reclutamientos_completa;

-- 3. Verificar si la vista tiene datos
SELECT 
    'Vista tiene datos' as estado,
    COUNT(*) as cantidad
FROM vista_reclutamientos_completa
UNION ALL
SELECT 
    'Tabla reclutamientos tiene datos' as estado,
    COUNT(*) as cantidad
FROM reclutamientos
UNION ALL
SELECT 
    'Tabla participantes tiene datos' as estado,
    COUNT(*) as cantidad
FROM participantes;

-- 4. Verificar la estructura de la vista
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'vista_reclutamientos_completa'
ORDER BY ordinal_position; 