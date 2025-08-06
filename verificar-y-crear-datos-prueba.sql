-- ====================================
-- VERIFICAR Y CREAR DATOS DE PRUEBA
-- ====================================
-- Ejecutar en Supabase SQL Editor

-- PASO 1: Verificar si las tablas existen
SELECT '=== VERIFICACIÓN DE TABLAS ===' as info;

SELECT 
    table_name,
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = table_name
    ) as existe
FROM (VALUES 
    ('departamentos'),
    ('participantes_internos')
) as t(table_name);

-- PASO 2: Verificar datos en departamentos
SELECT '=== DATOS EN DEPARTAMENTOS ===' as info;

SELECT COUNT(*) as total_departamentos
FROM departamentos;

-- Si no hay departamentos, crearlos
DO $$
BEGIN
    IF (SELECT COUNT(*) FROM departamentos) = 0 THEN
        RAISE NOTICE 'Creando departamentos de prueba...';
        
        INSERT INTO departamentos (id, nombre, categoria, orden, activo, creado_en, actualizado_en) VALUES
        (gen_random_uuid(), 'Recursos Humanos', 'Administración', 1, true, NOW(), NOW()),
        (gen_random_uuid(), 'Finanzas', 'Administración', 2, true, NOW(), NOW()),
        (gen_random_uuid(), 'Marketing', 'Comercial', 3, true, NOW(), NOW()),
        (gen_random_uuid(), 'Ventas', 'Comercial', 4, true, NOW(), NOW()),
        (gen_random_uuid(), 'Desarrollo de Producto', 'Técnico', 5, true, NOW(), NOW()),
        (gen_random_uuid(), 'Soporte Técnico', 'Técnico', 6, true, NOW(), NOW()),
        (gen_random_uuid(), 'Operaciones', 'Administración', 7, true, NOW(), NOW()),
        (gen_random_uuid(), 'Legal', 'Administración', 8, true, NOW(), NOW()),
        (gen_random_uuid(), 'Comunicaciones', 'Comercial', 9, true, NOW(), NOW()),
        (gen_random_uuid(), 'Investigación y Desarrollo', 'Técnico', 10, true, NOW(), NOW());
        
        RAISE NOTICE '✅ Departamentos creados exitosamente';
    ELSE
        RAISE NOTICE '✅ Ya existen departamentos en la tabla';
    END IF;
END $$;

-- PASO 3: Verificar datos en participantes_internos
SELECT '=== DATOS EN PARTICIPANTES_INTERNOS ===' as info;

SELECT COUNT(*) as total_participantes
FROM participantes_internos;

-- Si no hay participantes, crear algunos de prueba
DO $$
DECLARE
    dept_id UUID;
BEGIN
    IF (SELECT COUNT(*) FROM participantes_internos) = 0 THEN
        RAISE NOTICE 'Creando participantes de prueba...';
        
        -- Obtener un departamento para asignar
        SELECT id INTO dept_id FROM departamentos LIMIT 1;
        
        IF dept_id IS NOT NULL THEN
            INSERT INTO participantes_internos (id, nombre, email, departamento_id, rol_empresa_id, activo, creado_en, actualizado_en) VALUES
            (gen_random_uuid(), 'Juan Pérez', 'juan.perez@empresa.com', dept_id, NULL, true, NOW(), NOW()),
            (gen_random_uuid(), 'María García', 'maria.garcia@empresa.com', dept_id, NULL, true, NOW(), NOW()),
            (gen_random_uuid(), 'Carlos López', 'carlos.lopez@empresa.com', dept_id, NULL, true, NOW(), NOW());
            
            RAISE NOTICE '✅ Participantes creados exitosamente';
        ELSE
            RAISE NOTICE '❌ No se pudo crear participantes porque no hay departamentos';
        END IF;
    ELSE
        RAISE NOTICE '✅ Ya existen participantes en la tabla';
    END IF;
END $$;

-- PASO 4: Verificar datos finales
SELECT '=== VERIFICACIÓN FINAL ===' as info;

SELECT 'Departamentos:' as tipo, COUNT(*) as total
FROM departamentos
UNION ALL
SELECT 'Participantes:' as tipo, COUNT(*) as total
FROM participantes_internos;

-- Mostrar algunos datos
SELECT 'Departamentos disponibles:' as info;
SELECT id, nombre, categoria, orden
FROM departamentos 
ORDER BY orden, nombre
LIMIT 5;

SELECT 'Participantes disponibles:' as info;
SELECT 
    pi.id,
    pi.nombre,
    pi.email,
    d.nombre as departamento
FROM participantes_internos pi
LEFT JOIN departamentos d ON pi.departamento_id = d.id
ORDER BY pi.nombre
LIMIT 5;

SELECT '🎉 VERIFICACIÓN COMPLETADA' as resultado_final; 