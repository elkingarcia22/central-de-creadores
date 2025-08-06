-- ====================================
-- TABLA INVESTIGACIONES - ESTRUCTURA REAL
-- ====================================

-- Crear enums necesarios
DO $$ BEGIN
    CREATE TYPE enum_estado_investigacion AS ENUM ('en_borrador', 'por_iniciar', 'en_progreso', 'finalizado', 'pausado', 'cancelado');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE enum_tipo_prueba AS ENUM ('usabilidad', 'entrevista', 'encuesta', 'focus_group', 'card_sorting', 'tree_testing', 'a_b_testing');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE enum_plataforma AS ENUM ('web', 'mobile', 'desktop', 'tablet', 'smart_tv', 'wearable');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE enum_tipo_sesion AS ENUM ('presencial', 'virtual', 'hibrida');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Crear tabla investigaciones
CREATE TABLE IF NOT EXISTS investigaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Campos básicos requeridos
    nombre VARCHAR(255) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    producto_id VARCHAR(255) NOT NULL,
    tipo_investigacion_id VARCHAR(255) NOT NULL,
    
    -- Campos opcionales con foreign keys
    periodo_id VARCHAR(255),
    responsable_id UUID,
    implementador_id UUID,
    creado_por UUID,
    
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
    riesgo_automatico VARCHAR(50),
    
    -- Timestamps automáticos
    creado_el TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_el TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tablas de catálogos básicas si no existen
CREATE TABLE IF NOT EXISTS productos (
    id VARCHAR(255) PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    creado_el TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tipos_investigacion (
    id VARCHAR(255) PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    creado_el TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS periodo (
    id VARCHAR(255) PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    creado_el TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar datos de ejemplo en productos
INSERT INTO productos (id, nombre, descripcion) VALUES 
('prod-1', 'Producto Demo 1', 'Producto de demostración para pruebas'),
('prod-2', 'Producto Demo 2', 'Segundo producto de demostración'),
('prod-3', 'Aplicación Web', 'Aplicación web principal de la empresa')
ON CONFLICT (id) DO NOTHING;

-- Insertar datos de ejemplo en tipos de investigación
INSERT INTO tipos_investigacion (id, nombre, descripcion) VALUES 
('tipo-1', 'Estudio de Usabilidad', 'Evaluación de la facilidad de uso'),
('tipo-2', 'Investigación de Usuario', 'Comprensión profunda del usuario'),
('tipo-3', 'Test de Concepto', 'Validación de conceptos e ideas'),
('tipo-4', 'Entrevista Cualitativa', 'Entrevistas en profundidad con usuarios')
ON CONFLICT (id) DO NOTHING;

-- Insertar datos de ejemplo en períodos
INSERT INTO periodo (id, nombre, descripcion) VALUES 
('2024-q1', '2024 Q1', 'Primer trimestre de 2024'),
('2024-q2', '2024 Q2', 'Segundo trimestre de 2024'),
('2024-q3', '2024 Q3', 'Tercer trimestre de 2024'),
('2024-q4', '2024 Q4', 'Cuarto trimestre de 2024')
ON CONFLICT (id) DO NOTHING;

-- Función para calcular riesgo automático
CREATE OR REPLACE FUNCTION calcular_riesgo_investigacion()
RETURNS TRIGGER AS $$
DECLARE
    dias_diferencia INTEGER;
    riesgo VARCHAR(50);
BEGIN
    -- Calcular días entre fecha inicio y fin
    dias_diferencia := NEW.fecha_fin - NEW.fecha_inicio;
    
    -- Determinar riesgo basado en duración y estado
    IF NEW.estado = 'cancelado' THEN
        riesgo := 'cancelado';
    ELSIF NEW.estado = 'finalizado' THEN
        riesgo := 'completado';
    ELSIF dias_diferencia > 90 THEN
        riesgo := 'alto';
    ELSIF dias_diferencia > 30 THEN
        riesgo := 'medio';
    ELSE
        riesgo := 'bajo';
    END IF;
    
    NEW.riesgo_automatico := riesgo;
    NEW.actualizado_el := NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para calcular riesgo automáticamente
DROP TRIGGER IF EXISTS trigger_calcular_riesgo ON investigaciones;
CREATE TRIGGER trigger_calcular_riesgo
    BEFORE INSERT OR UPDATE ON investigaciones
    FOR EACH ROW
    EXECUTE FUNCTION calcular_riesgo_investigacion();

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_investigaciones_estado ON investigaciones(estado);
CREATE INDEX IF NOT EXISTS idx_investigaciones_producto ON investigaciones(producto_id);
CREATE INDEX IF NOT EXISTS idx_investigaciones_tipo ON investigaciones(tipo_investigacion_id);
CREATE INDEX IF NOT EXISTS idx_investigaciones_responsable ON investigaciones(responsable_id);
CREATE INDEX IF NOT EXISTS idx_investigaciones_fechas ON investigaciones(fecha_inicio, fecha_fin);
CREATE INDEX IF NOT EXISTS idx_investigaciones_creado_el ON investigaciones(creado_el);

-- Políticas RLS básicas (permisivas para pruebas)
ALTER TABLE investigaciones ENABLE ROW LEVEL SECURITY;

-- Política que permite todo a usuarios autenticados (temporal para pruebas)
DROP POLICY IF EXISTS "Permitir todo a usuarios autenticados" ON investigaciones;
CREATE POLICY "Permitir todo a usuarios autenticados" ON investigaciones
    FOR ALL USING (auth.role() = 'authenticated');

-- Políticas para tablas de catálogos (lectura pública)
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir lectura productos" ON productos;
CREATE POLICY "Permitir lectura productos" ON productos
    FOR SELECT USING (true);

ALTER TABLE tipos_investigacion ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir lectura tipos" ON tipos_investigacion;
CREATE POLICY "Permitir lectura tipos" ON tipos_investigacion
    FOR SELECT USING (true);

ALTER TABLE periodo ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir lectura periodos" ON periodo;
CREATE POLICY "Permitir lectura periodos" ON periodo
    FOR SELECT USING (true);

-- Comentarios para documentación
COMMENT ON TABLE investigaciones IS 'Tabla principal de investigaciones de UX/UI';
COMMENT ON COLUMN investigaciones.nombre IS 'Nombre descriptivo de la investigación';
COMMENT ON COLUMN investigaciones.riesgo_automatico IS 'Riesgo calculado automáticamente basado en duración y estado';
COMMENT ON COLUMN investigaciones.estado IS 'Estado actual de la investigación';
COMMENT ON COLUMN investigaciones.tipo_prueba IS 'Tipo específico de prueba a realizar';

-- Verificación final
SELECT 
    'Tabla investigaciones creada exitosamente' as mensaje,
    COUNT(*) as total_registros
FROM investigaciones; 