-- ====================================
-- VERIFICAR Y POBLAR ESTADOS DE PARTICIPANTE
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar si existe la tabla
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'estado_participante_cat') 
        THEN 'Tabla estado_participante_cat EXISTE'
        ELSE 'Tabla estado_participante_cat NO EXISTE'
    END as estado_tabla;

-- 2. Si no existe, crear la tabla
CREATE TABLE IF NOT EXISTS estado_participante_cat (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL UNIQUE,
    descripcion TEXT,
    color VARCHAR(7) DEFAULT '#6B7280',
    activo BOOLEAN DEFAULT true,
    orden INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Verificar datos existentes
SELECT 
    '=== DATOS EXISTENTES ===' as info,
    COUNT(*) as total_estados
FROM estado_participante_cat;

-- 4. Mostrar estados existentes
SELECT 
    id,
    nombre,
    descripcion,
    color,
    activo,
    orden
FROM estado_participante_cat 
ORDER BY orden, nombre;

-- 5. Insertar estados básicos si no existen
INSERT INTO estado_participante_cat (nombre, descripcion, color, orden, activo) VALUES
    ('Disponible', 'Participante disponible para nuevas investigaciones', '#10B981', 1, true),
    ('Enfriamiento', 'Participante en período de enfriamiento', '#F59E0B', 2, true),
    ('No disponible', 'Participante no disponible temporalmente', '#EF4444', 3, true),
    ('Activo', 'Participante activo en investigaciones', '#3B82F6', 4, true),
    ('Inactivo', 'Participante inactivo', '#6B7280', 5, true)
ON CONFLICT (nombre) DO NOTHING;

-- 6. Verificar estados finales
SELECT 
    '=== ESTADOS FINALES ===' as info;
    
SELECT 
    id,
    nombre,
    descripcion,
    color,
    activo,
    orden
FROM estado_participante_cat 
WHERE activo = true
ORDER BY orden, nombre;

-- 7. Verificar participantes con estados
SELECT 
    '=== PARTICIPANTES CON ESTADOS ===' as info;
    
SELECT 
    p.id,
    p.nombre,
    p.estado_participante,
    epc.nombre as estado_nombre,
    epc.color as estado_color
FROM participantes p
LEFT JOIN estado_participante_cat epc ON p.estado_participante = epc.id
WHERE p.estado_participante IS NOT NULL
ORDER BY p.nombre
LIMIT 10;

-- 8. Contar participantes por estado
SELECT 
    '=== CONTEO POR ESTADO ===' as info;
    
SELECT 
    COALESCE(epc.nombre, 'Sin estado') as estado,
    COUNT(*) as cantidad
FROM participantes p
LEFT JOIN estado_participante_cat epc ON p.estado_participante = epc.id
GROUP BY epc.nombre
ORDER BY cantidad DESC;
