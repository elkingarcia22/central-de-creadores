-- ========================================================
-- SETUP COMPLETO TABLA INVESTIGACIONES - SUPABASE
-- ========================================================

-- 1. CREAR ENUMS NECESARIOS
DO $$ BEGIN
    CREATE TYPE enum_estado_investigacion AS ENUM (
        'en_borrador', 
        'por_iniciar', 
        'en_progreso', 
        'finalizado', 
        'pausado', 
        'cancelado'
    );
EXCEPTION
    WHEN duplicate_object THEN 
    RAISE NOTICE 'enum_estado_investigacion ya existe';
END $$;

DO $$ BEGIN
    CREATE TYPE enum_tipo_prueba AS ENUM (
        'usabilidad', 
        'entrevista', 
        'encuesta', 
        'focus_group', 
        'card_sorting', 
        'tree_testing', 
        'a_b_testing'
    );
EXCEPTION
    WHEN duplicate_object THEN 
    RAISE NOTICE 'enum_tipo_prueba ya existe';
END $$;

DO $$ BEGIN
    CREATE TYPE enum_plataforma AS ENUM (
        'web', 
        'mobile', 
        'desktop', 
        'tablet', 
        'smart_tv', 
        'wearable'
    );
EXCEPTION
    WHEN duplicate_object THEN 
    RAISE NOTICE 'enum_plataforma ya existe';
END $$;

DO $$ BEGIN
    CREATE TYPE enum_tipo_sesion AS ENUM (
        'presencial', 
        'virtual', 
        'hibrida'
    );
EXCEPTION
    WHEN duplicate_object THEN 
    RAISE NOTICE 'enum_tipo_sesion ya existe';
END $$;

-- 2. CREAR TABLAS DE CATÁLOGOS SI NO EXISTEN

-- Tabla productos
CREATE TABLE IF NOT EXISTS productos (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla tipos_investigacion
CREATE TABLE IF NOT EXISTS tipos_investigacion (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla periodo
CREATE TABLE IF NOT EXISTS periodo (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    etiqueta TEXT NOT NULL,
    ano INTEGER,
    trimestre INTEGER,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CREAR TABLA INVESTIGACIONES PRINCIPAL
CREATE TABLE IF NOT EXISTS investigaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Campos básicos requeridos
    nombre TEXT NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    
    -- Foreign keys a catálogos (texto por compatibilidad)
    producto_id TEXT REFERENCES productos(id),
    tipo_investigacion_id TEXT REFERENCES tipos_investigacion(id),
    periodo_id TEXT REFERENCES periodo(id),
    
    -- Foreign keys a usuarios (UUID)
    responsable_id UUID REFERENCES auth.users(id),
    implementador_id UUID REFERENCES auth.users(id),
    creado_por UUID REFERENCES auth.users(id),
    
    -- Trazabilidad: seguimiento de origen
    seguimiento_origen_id UUID,
    
    -- Campos de estado y configuración
    estado enum_estado_investigacion DEFAULT 'en_borrador',
    tipo_prueba enum_tipo_prueba,
    plataforma enum_plataforma,
    tipo_sesion enum_tipo_sesion,
    
    -- Campos de contenido
    libreto TEXT,
    link_prueba TEXT,
    link_resultados TEXT,
    notas_seguimiento TEXT,
    
    -- Campo calculado automáticamente
    riesgo_automatico TEXT,
    
    -- Timestamps automáticos
    creado_el TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_el TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. INSERTAR DATOS DE EJEMPLO EN CATÁLOGOS

-- Productos de ejemplo
INSERT INTO productos (id, nombre, descripcion) VALUES 
('01acf3dd-d883-410b-aa5e-3f8c8fec1670', 'Design system', 'Sistema de diseño de la empresa'),
('07baf27d-5273-46c6-b2bc-8829d7f3b573', 'Comunicaciones', 'Herramientas de comunicación interna'),
('08e6b770-b69e-4e4e-aeef-aec8c5c247b1', 'Analytics', 'Plataforma de análisis de datos'),
('0b513a20-60dd-4541-b464-4fd0ca74feac', 'Objetivos', 'Sistema de gestión de objetivos')
ON CONFLICT (id) DO NOTHING;

-- Tipos de investigación de ejemplo
INSERT INTO tipos_investigacion (id, nombre, descripcion) VALUES 
('b8ebc601-e349-470c-ba4c-ff28491f36dd', 'Usabilidad', 'Estudios de usabilidad de interfaces'),
('11a4b1cc-24dc-4955-a3e7-c87ab228546a', 'A/B Testing', 'Pruebas comparativas entre versiones'),
('1f7e32e9-b47c-4328-af98-bf957f786e6f', 'Focus group', 'Sesiones grupales de retroalimentación'),
('2408eebd-07e1-4967-a831-fc77d29e7ea4', 'First Click Testing', 'Pruebas de primer clic')
ON CONFLICT (id) DO NOTHING;

-- Períodos de ejemplo
INSERT INTO periodo (id, nombre, etiqueta, ano, trimestre) VALUES 
('04352043-59d9-46ba-9ffa-26920349de9c', '2027-Q4', '2027-Q4', 2027, 4),
('12a79d96-c875-4641-a8cb-8e487ba1b62c', 'Q2 2024', 'Q2 2024', 2024, 2),
('157b6094-f606-46f1-9f1a-f6bb4abf0fbf', '2028-Q3', '2028-Q3', 2028, 3),
('2024-q1', '2024-Q1', '2024-Q1', 2024, 1),
('2024-q3', '2024-Q3', '2024-Q3', 2024, 3),
('2024-q4', '2024-Q4', '2024-Q4', 2024, 4)
ON CONFLICT (id) DO NOTHING;

-- 5. CREAR FUNCIÓN PARA ACTUALIZAR updated_at AUTOMÁTICAMENTE
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. CREAR TRIGGERS PARA ACTUALIZAR AUTOMÁTICAMENTE updated_at
CREATE TRIGGER update_productos_updated_at 
    BEFORE UPDATE ON productos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tipos_investigacion_updated_at 
    BEFORE UPDATE ON tipos_investigacion 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_periodo_updated_at 
    BEFORE UPDATE ON periodo 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investigaciones_actualizado_el 
    BEFORE UPDATE ON investigaciones 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. CREAR POLÍTICAS RLS (Row Level Security)

-- Habilitar RLS en todas las tablas
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_investigacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE periodo ENABLE ROW LEVEL SECURITY;
ALTER TABLE investigaciones ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas para usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden ver productos" ON productos
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden ver tipos_investigacion" ON tipos_investigacion
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden ver periodos" ON periodo
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden ver investigaciones" ON investigaciones
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden crear investigaciones" ON investigaciones
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar investigaciones" ON investigaciones
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden eliminar investigaciones" ON investigaciones
    FOR DELETE USING (auth.role() = 'authenticated');

-- 8. CREAR VISTA investigaciones_con_usuarios
CREATE OR REPLACE VIEW investigaciones_con_usuarios AS
SELECT 
    i.*,
    -- Datos del responsable
    p1.full_name as responsable_nombre,
    p1.email as responsable_email,
    p1.avatar_url as responsable_avatar,
    -- Datos del implementador
    p2.full_name as implementador_nombre,
    p2.email as implementador_email,
    p2.avatar_url as implementador_avatar,
    -- Datos del creador
    p3.full_name as creado_por_nombre,
    p3.email as creado_por_email,
    p3.avatar_url as creado_por_avatar,
    -- Datos de catálogos
    prod.nombre as producto_nombre,
    tipo.nombre as tipo_investigacion_nombre,
    per.etiqueta as periodo_nombre
FROM investigaciones i
LEFT JOIN profiles p1 ON i.responsable_id = p1.id
LEFT JOIN profiles p2 ON i.implementador_id = p2.id
LEFT JOIN profiles p3 ON i.creado_por = p3.id
LEFT JOIN productos prod ON i.producto_id = prod.id
LEFT JOIN tipos_investigacion tipo ON i.tipo_investigacion_id = tipo.id
LEFT JOIN periodo per ON i.periodo_id = per.id;

-- 9. VERIFICAR INSTALACIÓN
DO $$
BEGIN
    RAISE NOTICE '✅ Setup de investigaciones completado exitosamente';
    RAISE NOTICE '📊 Tablas creadas: productos, tipos_investigacion, periodo, investigaciones';
    RAISE NOTICE '👁️ Vista creada: investigaciones_con_usuarios';
    RAISE NOTICE '🔒 Políticas RLS configuradas';
    RAISE NOTICE '⚡ Triggers de actualización automática configurados';
END $$;

-- 10. CONSULTA DE VERIFICACIÓN
SELECT 
    'investigaciones' as tabla,
    COUNT(*) as registros
FROM investigaciones
UNION ALL
SELECT 
    'productos' as tabla,
    COUNT(*) as registros
FROM productos
UNION ALL
SELECT 
    'tipos_investigacion' as tabla,
    COUNT(*) as registros
FROM tipos_investigacion
UNION ALL
SELECT 
    'periodo' as tabla,
    COUNT(*) as registros
FROM periodo; 