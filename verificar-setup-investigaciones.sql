-- Script para verificar que el setup de investigaciones se completó correctamente

-- 1. Verificar que las tablas existen
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('investigaciones', 'productos', 'tipos_investigacion', 'periodo')
ORDER BY table_name;

-- 2. Verificar enums
SELECT typname as enum_name
FROM pg_type 
WHERE typname LIKE 'enum_%'
ORDER BY typname;

-- 3. Contar registros en cada tabla
SELECT 'productos' as tabla, COUNT(*) as registros FROM productos
UNION ALL
SELECT 'tipos_investigacion' as tabla, COUNT(*) as registros FROM tipos_investigacion
UNION ALL
SELECT 'periodo' as tabla, COUNT(*) as registros FROM periodo
UNION ALL
SELECT 'investigaciones' as tabla, COUNT(*) as registros FROM investigaciones;

-- 4. Verificar que la vista existe
SELECT viewname 
FROM pg_views 
WHERE viewname = 'investigaciones_con_usuarios';

-- 5. Probar inserción de una investigación de prueba
INSERT INTO investigaciones (
    nombre, 
    fecha_inicio, 
    fecha_fin, 
    producto_id, 
    tipo_investigacion_id, 
    estado
) VALUES (
    'Investigación de Prueba - Setup',
    '2024-01-15',
    '2024-02-15',
    (SELECT id FROM productos LIMIT 1),
    (SELECT id FROM tipos_investigacion LIMIT 1),
    'en_borrador'
);

-- 6. Verificar que se insertó correctamente
SELECT 
    nombre,
    estado,
    producto_id,
    tipo_investigacion_id,
    creado_el
FROM investigaciones 
WHERE nombre = 'Investigación de Prueba - Setup';

-- 7. Probar la vista completa
SELECT 
    nombre,
    estado,
    producto_nombre,
    tipo_investigacion_nombre
FROM investigaciones_con_usuarios 
WHERE nombre = 'Investigación de Prueba - Setup'; 