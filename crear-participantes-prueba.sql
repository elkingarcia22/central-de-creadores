-- ====================================
-- CREAR PARTICIPANTES DE PRUEBA
-- ====================================
-- Ejecutar en Supabase SQL Editor

-- PASO 1: Verificar departamentos disponibles
SELECT 'Departamentos disponibles:' as info;
SELECT id, nombre, categoria 
FROM departamentos 
WHERE activo = true 
ORDER BY orden, nombre 
LIMIT 5;

-- PASO 2: Crear participantes de prueba
DO $$
DECLARE
    dep_id_rh UUID;
    dep_id_dev UUID;
    dep_id_mkt UUID;
    dep_id_ventas UUID;
BEGIN
    -- Obtener IDs de departamentos
    SELECT id INTO dep_id_rh FROM departamentos WHERE nombre = 'Recursos Humanos' LIMIT 1;
    SELECT id INTO dep_id_dev FROM departamentos WHERE nombre = 'Desarrollo de Software' LIMIT 1;
    SELECT id INTO dep_id_mkt FROM departamentos WHERE nombre = 'Marketing Digital' LIMIT 1;
    SELECT id INTO dep_id_ventas FROM departamentos WHERE nombre = 'Ventas' LIMIT 1;
    
    -- Si no encuentra departamentos específicos, usar el primero disponible
    IF dep_id_rh IS NULL THEN
        SELECT id INTO dep_id_rh FROM departamentos WHERE activo = true LIMIT 1;
    END IF;
    IF dep_id_dev IS NULL THEN
        SELECT id INTO dep_id_dev FROM departamentos WHERE activo = true LIMIT 1;
    END IF;
    IF dep_id_mkt IS NULL THEN
        SELECT id INTO dep_id_mkt FROM departamentos WHERE activo = true LIMIT 1;
    END IF;
    IF dep_id_ventas IS NULL THEN
        SELECT id INTO dep_id_ventas FROM departamentos WHERE activo = true LIMIT 1;
    END IF;

    -- Insertar participantes de prueba
    INSERT INTO participantes_internos (nombre, email, departamento_id, activo, creado_en, actualizado_en) VALUES
    ('Juan Pérez', 'juan.perez@empresa.com', dep_id_rh, true, NOW(), NOW()),
    ('María García', 'maria.garcia@empresa.com', dep_id_dev, true, NOW(), NOW()),
    ('Carlos López', 'carlos.lopez@empresa.com', dep_id_mkt, true, NOW(), NOW()),
    ('Ana Rodríguez', 'ana.rodriguez@empresa.com', dep_id_ventas, true, NOW(), NOW()),
    ('Luis Martínez', 'luis.martinez@empresa.com', dep_id_rh, true, NOW(), NOW())
    ON CONFLICT (email) DO NOTHING;
    
    RAISE NOTICE '✅ Participantes de prueba creados exitosamente';
END $$;

-- PASO 3: Verificar participantes creados
SELECT 'Participantes creados:' as info;
SELECT 
    pi.id,
    pi.nombre,
    pi.email,
    d.nombre as departamento,
    d.categoria
FROM participantes_internos pi
LEFT JOIN departamentos d ON pi.departamento_id = d.id
WHERE pi.activo = true
ORDER BY pi.nombre;

-- PASO 4: Contar total
SELECT 'Resumen:' as info;
SELECT 
    'Departamentos' as tipo, COUNT(*) as total
FROM departamentos 
WHERE activo = true
UNION ALL
SELECT 
    'Participantes' as tipo, COUNT(*) as total
FROM participantes_internos 
WHERE activo = true; 