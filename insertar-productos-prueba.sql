-- ====================================
-- INSERTAR PRODUCTOS DE PRUEBA
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- Verificar si la tabla productos existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'productos') 
        THEN 'Tabla productos EXISTE'
        ELSE 'Tabla productos NO EXISTE'
    END as estado_tabla;

-- Verificar estructura de la tabla productos
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'productos'
ORDER BY ordinal_position;

-- Insertar productos de prueba (solo si no existen)
INSERT INTO productos (nombre, activo)
SELECT 'Analytics', true
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Analytics');

INSERT INTO productos (nombre, activo)
SELECT 'API', true
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'API');

INSERT INTO productos (nombre, activo)
SELECT 'Dashboard', true
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Dashboard');

INSERT INTO productos (nombre, activo)
SELECT 'Mobile App', true
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Mobile App');

INSERT INTO productos (nombre, activo)
SELECT 'Web Platform', true
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Web Platform');

INSERT INTO productos (nombre, activo)
SELECT 'CRM', true
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'CRM');

INSERT INTO productos (nombre, activo)
SELECT 'ERP', true
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'ERP');

INSERT INTO productos (nombre, activo)
SELECT 'BI Tools', true
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'BI Tools');

INSERT INTO productos (nombre, activo)
SELECT 'Cloud Services', true
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Cloud Services');

INSERT INTO productos (nombre, activo)
SELECT 'Security Suite', true
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Security Suite');

-- Verificar productos insertados
SELECT 
    id,
    nombre,
    activo,
    created_at
FROM productos 
ORDER BY nombre;
