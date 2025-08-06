-- Verificar estructura completa de reclutamientos

-- 1. VER TODAS LAS COLUMNAS CON RESTRICCIONES
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'reclutamientos'
ORDER BY ordinal_position;

-- 2. VER EJEMPLO DE RECLUTAMIENTOS EXISTENTES
SELECT 
    id,
    investigacion_id,
    participantes_id,
    estado_agendamiento,
    fecha_sesion
FROM reclutamientos 
LIMIT 3;

-- 3. BUSCAR INVESTIGACIONES DISPONIBLES
SELECT 
    id,
    nombre,
    estado
FROM investigaciones 
LIMIT 5; 