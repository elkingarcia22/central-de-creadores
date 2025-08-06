-- ====================================
-- ESQUEMA COMPLETO MÓDULO INVESTIGACIONES
-- ====================================

-- 1. TABLA PRINCIPAL DE INVESTIGACIONES
CREATE TABLE IF NOT EXISTS investigaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    objetivos TEXT,
    metodologia TEXT,
    estado VARCHAR(50) DEFAULT 'borrador' CHECK (estado IN ('borrador', 'planificada', 'activa', 'pausada', 'completada', 'archivada')),
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('usabilidad', 'mercado', 'concepto', 'accesibilidad', 'entrevista', 'encuesta', 'focus_group')),
    prioridad VARCHAR(20) DEFAULT 'media' CHECK (prioridad IN ('baja', 'media', 'alta', 'critica')),
    
    -- Fechas
    fecha_inicio DATE,
    fecha_fin DATE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Métricas
    progreso INTEGER DEFAULT 0 CHECK (progreso >= 0 AND progreso <= 100),
    participantes_objetivo INTEGER DEFAULT 0,
    participantes_actuales INTEGER DEFAULT 0,
    sesiones_programadas INTEGER DEFAULT 0,
    sesiones_completadas INTEGER DEFAULT 0,
    
    -- Presupuesto
    presupuesto_total DECIMAL(10,2) DEFAULT 0,
    presupuesto_utilizado DECIMAL(10,2) DEFAULT 0,
    
    -- Relaciones
    creador_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    empresa_id UUID, -- Referencia a tabla empresas (opcional)
    
    -- Metadatos
    tags TEXT[] DEFAULT '{}',
    configuracion JSONB DEFAULT '{}', -- Para configuraciones específicas
    resultados JSONB DEFAULT '{}', -- Para almacenar resultados
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABLA DE EMPRESAS (CLIENTES)
CREATE TABLE IF NOT EXISTS empresas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    industria VARCHAR(100),
    tamano VARCHAR(50) CHECK (tamano IN ('startup', 'pequena', 'mediana', 'grande', 'enterprise')),
    
    -- Contacto
    sitio_web VARCHAR(255),
    email_contacto VARCHAR(255),
    telefono VARCHAR(50),
    direccion TEXT,
    
    -- Configuración
    logo_url TEXT,
    color_marca VARCHAR(7), -- Hex color
    configuracion JSONB DEFAULT '{}',
    
    -- Estado
    activa BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agregar referencia de empresa después de crear tabla empresas
ALTER TABLE investigaciones ADD CONSTRAINT fk_investigaciones_empresa 
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE SET NULL;

-- 3. TABLA DE SESIONES
CREATE TABLE IF NOT EXISTS sesiones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigacion_id UUID NOT NULL REFERENCES investigaciones(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    
    -- Programación
    fecha_programada TIMESTAMP WITH TIME ZONE,
    duracion_minutos INTEGER DEFAULT 60,
    estado VARCHAR(50) DEFAULT 'programada' CHECK (estado IN ('programada', 'en_curso', 'completada', 'cancelada', 'reprogramada')),
    
    -- Ubicación
    tipo_sesion VARCHAR(50) DEFAULT 'virtual' CHECK (tipo_sesion IN ('virtual', 'presencial', 'hibrida')),
    ubicacion TEXT, -- URL para virtual, dirección para presencial
    sala VARCHAR(100),
    
    -- Personal
    moderador_id UUID REFERENCES profiles(id),
    observadores UUID[] DEFAULT '{}', -- Array de IDs de observadores
    
    -- Configuración
    grabacion_permitida BOOLEAN DEFAULT false,
    notas_publicas TEXT,
    notas_privadas TEXT,
    configuracion JSONB DEFAULT '{}',
    
    -- Resultados
    fecha_inicio_real TIMESTAMP WITH TIME ZONE,
    fecha_fin_real TIMESTAMP WITH TIME ZONE,
    resultados JSONB DEFAULT '{}',
    archivos_adjuntos TEXT[] DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABLA DE PARTICIPANTES EN INVESTIGACIONES
CREATE TABLE IF NOT EXISTS investigacion_participantes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigacion_id UUID NOT NULL REFERENCES investigaciones(id) ON DELETE CASCADE,
    participante_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Estado de participación
    estado VARCHAR(50) DEFAULT 'invitado' CHECK (estado IN ('invitado', 'confirmado', 'activo', 'completado', 'abandonado', 'excluido')),
    fecha_invitacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_confirmacion TIMESTAMP WITH TIME ZONE,
    fecha_completacion TIMESTAMP WITH TIME ZONE,
    
    -- Compensación
    compensacion_acordada DECIMAL(8,2) DEFAULT 0,
    compensacion_pagada DECIMAL(8,2) DEFAULT 0,
    metodo_pago VARCHAR(50),
    
    -- Notas
    notas TEXT,
    criterios_cumplidos JSONB DEFAULT '{}',
    
    -- Restricciones
    UNIQUE(investigacion_id, participante_id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABLA DE PARTICIPANTES EN SESIONES
CREATE TABLE IF NOT EXISTS sesion_participantes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sesion_id UUID NOT NULL REFERENCES sesiones(id) ON DELETE CASCADE,
    participante_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Estado
    estado VARCHAR(50) DEFAULT 'invitado' CHECK (estado IN ('invitado', 'confirmado', 'presente', 'ausente', 'cancelado')),
    fecha_confirmacion TIMESTAMP WITH TIME ZONE,
    
    -- Asistencia
    hora_llegada TIMESTAMP WITH TIME ZONE,
    hora_salida TIMESTAMP WITH TIME ZONE,
    asistencia_completa BOOLEAN DEFAULT false,
    
    -- Evaluación
    puntuacion INTEGER CHECK (puntuacion >= 1 AND puntuacion <= 5),
    comentarios TEXT,
    
    -- Restricciones
    UNIQUE(sesion_id, participante_id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABLA DE CRITERIOS DE PARTICIPACIÓN
CREATE TABLE IF NOT EXISTS criterios_participacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigacion_id UUID NOT NULL REFERENCES investigaciones(id) ON DELETE CASCADE,
    
    -- Criterio
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('edad', 'genero', 'ubicacion', 'profesion', 'experiencia', 'tecnologia', 'personalizado')),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    
    -- Configuración del criterio
    requerido BOOLEAN DEFAULT true,
    valor_minimo VARCHAR(255),
    valor_maximo VARCHAR(255),
    valores_permitidos TEXT[] DEFAULT '{}',
    
    -- Orden y agrupación
    orden_prioridad INTEGER DEFAULT 0,
    grupo VARCHAR(100),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TABLA DE ARCHIVOS Y DOCUMENTOS
CREATE TABLE IF NOT EXISTS investigacion_archivos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigacion_id UUID REFERENCES investigaciones(id) ON DELETE CASCADE,
    sesion_id UUID REFERENCES sesiones(id) ON DELETE CASCADE,
    
    -- Información del archivo
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo_archivo VARCHAR(50) NOT NULL CHECK (tipo_archivo IN ('documento', 'imagen', 'video', 'audio', 'presentacion', 'prototipo', 'reporte')),
    url_archivo TEXT NOT NULL,
    tamano_bytes BIGINT,
    
    -- Metadatos
    subido_por UUID NOT NULL REFERENCES profiles(id),
    publico BOOLEAN DEFAULT false,
    tags TEXT[] DEFAULT '{}',
    
    -- Restricciones: debe pertenecer a investigación O sesión
    CHECK (
        (investigacion_id IS NOT NULL AND sesion_id IS NULL) OR 
        (investigacion_id IS NULL AND sesion_id IS NOT NULL)
    ),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ====================================

-- Investigaciones
CREATE INDEX IF NOT EXISTS idx_investigaciones_estado ON investigaciones(estado);
CREATE INDEX IF NOT EXISTS idx_investigaciones_tipo ON investigaciones(tipo);
CREATE INDEX IF NOT EXISTS idx_investigaciones_creador ON investigaciones(creador_id);
CREATE INDEX IF NOT EXISTS idx_investigaciones_empresa ON investigaciones(empresa_id);
CREATE INDEX IF NOT EXISTS idx_investigaciones_fechas ON investigaciones(fecha_inicio, fecha_fin);
CREATE INDEX IF NOT EXISTS idx_investigaciones_tags ON investigaciones USING GIN(tags);

-- Sesiones
CREATE INDEX IF NOT EXISTS idx_sesiones_investigacion ON sesiones(investigacion_id);
CREATE INDEX IF NOT EXISTS idx_sesiones_fecha ON sesiones(fecha_programada);
CREATE INDEX IF NOT EXISTS idx_sesiones_estado ON sesiones(estado);
CREATE INDEX IF NOT EXISTS idx_sesiones_moderador ON sesiones(moderador_id);

-- Participantes
CREATE INDEX IF NOT EXISTS idx_investigacion_participantes_investigacion ON investigacion_participantes(investigacion_id);
CREATE INDEX IF NOT EXISTS idx_investigacion_participantes_participante ON investigacion_participantes(participante_id);
CREATE INDEX IF NOT EXISTS idx_sesion_participantes_sesion ON sesion_participantes(sesion_id);
CREATE INDEX IF NOT EXISTS idx_sesion_participantes_participante ON sesion_participantes(participante_id);

-- Empresas
CREATE INDEX IF NOT EXISTS idx_empresas_activa ON empresas(activa);
CREATE INDEX IF NOT EXISTS idx_empresas_industria ON empresas(industria);

-- Archivos
CREATE INDEX IF NOT EXISTS idx_archivos_investigacion ON investigacion_archivos(investigacion_id);
CREATE INDEX IF NOT EXISTS idx_archivos_sesion ON investigacion_archivos(sesion_id);
CREATE INDEX IF NOT EXISTS idx_archivos_tipo ON investigacion_archivos(tipo_archivo);

-- ====================================
-- FUNCIONES Y TRIGGERS
-- ====================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_investigaciones_updated_at 
    BEFORE UPDATE ON investigaciones 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sesiones_updated_at 
    BEFORE UPDATE ON sesiones 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_empresas_updated_at 
    BEFORE UPDATE ON empresas 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Función para actualizar contadores automáticamente
CREATE OR REPLACE FUNCTION actualizar_contadores_investigacion()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar participantes_actuales
    UPDATE investigaciones 
    SET participantes_actuales = (
        SELECT COUNT(*) 
        FROM investigacion_participantes 
        WHERE investigacion_id = COALESCE(NEW.investigacion_id, OLD.investigacion_id)
        AND estado IN ('confirmado', 'activo', 'completado')
    )
    WHERE id = COALESCE(NEW.investigacion_id, OLD.investigacion_id);
    
    -- Actualizar sesiones_completadas
    UPDATE investigaciones 
    SET sesiones_completadas = (
        SELECT COUNT(*) 
        FROM sesiones 
        WHERE investigacion_id = COALESCE(NEW.investigacion_id, OLD.investigacion_id)
        AND estado = 'completada'
    )
    WHERE id = COALESCE(NEW.investigacion_id, OLD.investigacion_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Triggers para actualizar contadores
CREATE TRIGGER trigger_actualizar_contadores_participantes
    AFTER INSERT OR UPDATE OR DELETE ON investigacion_participantes
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_contadores_investigacion();

CREATE TRIGGER trigger_actualizar_contadores_sesiones
    AFTER INSERT OR UPDATE OR DELETE ON sesiones
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_contadores_investigacion();

-- ====================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY)
-- ====================================

-- Habilitar RLS en todas las tablas
ALTER TABLE investigaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE sesiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE investigacion_participantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sesion_participantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE criterios_participacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE investigacion_archivos ENABLE ROW LEVEL SECURITY;

-- Políticas para investigaciones
CREATE POLICY "investigaciones_select_authenticated" ON investigaciones
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "investigaciones_insert_authenticated" ON investigaciones
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "investigaciones_update_authenticated" ON investigaciones
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "investigaciones_delete_authenticated" ON investigaciones
    FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas para sesiones
CREATE POLICY "sesiones_select_authenticated" ON sesiones
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "sesiones_insert_authenticated" ON sesiones
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "sesiones_update_authenticated" ON sesiones
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "sesiones_delete_authenticated" ON sesiones
    FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas para participantes
CREATE POLICY "participantes_select_authenticated" ON investigacion_participantes
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "participantes_insert_authenticated" ON investigacion_participantes
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "participantes_update_authenticated" ON investigacion_participantes
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "participantes_delete_authenticated" ON investigacion_participantes
    FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas para empresas
CREATE POLICY "empresas_select_authenticated" ON empresas
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "empresas_insert_authenticated" ON empresas
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "empresas_update_authenticated" ON empresas
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "empresas_delete_authenticated" ON empresas
    FOR DELETE USING (auth.role() = 'authenticated');

-- ====================================
-- DATOS DE EJEMPLO
-- ====================================

-- Insertar empresas de ejemplo
INSERT INTO empresas (nombre, descripcion, industria, tamano, sitio_web, email_contacto) VALUES
    ('TechCorp Solutions', 'Empresa de tecnología especializada en e-commerce', 'Tecnología', 'mediana', 'https://techcorp.com', 'contacto@techcorp.com'),
    ('FinanceHub', 'Plataforma de servicios financieros digitales', 'Fintech', 'grande', 'https://financehub.com', 'info@financehub.com'),
    ('HealthTech Innovations', 'Desarrollo de aplicaciones de salud digital', 'Salud', 'pequena', 'https://healthtech.com', 'hello@healthtech.com'),
    ('GovDigital', 'Digitalización de servicios gubernamentales', 'Gobierno', 'enterprise', 'https://govdigital.gov', 'contacto@govdigital.gov')
ON CONFLICT DO NOTHING;

-- Insertar investigaciones de ejemplo
INSERT INTO investigaciones (
    titulo, descripcion, objetivos, estado, tipo, prioridad,
    fecha_inicio, fecha_fin, participantes_objetivo, creador_id
) VALUES
    (
        'Estudio de Usabilidad de E-commerce',
        'Análisis completo de la experiencia de usuario en plataformas de comercio electrónico para identificar puntos de fricción y oportunidades de mejora.',
        'Identificar problemas de usabilidad en el proceso de compra, evaluar la navegación del sitio, analizar la efectividad del diseño responsive',
        'activa',
        'usabilidad',
        'alta',
        '2024-01-15',
        '2024-03-15',
        25,
        (SELECT id FROM profiles LIMIT 1)
    ),
    (
        'Investigación de Mercado - Productos Fintech',
        'Estudio sobre preferencias y comportamientos de usuarios en productos financieros digitales.',
        'Comprender las necesidades del mercado objetivo, evaluar la competencia, identificar oportunidades de innovación',
        'planificada',
        'mercado',
        'media',
        '2024-02-01',
        '2024-04-01',
        40,
        (SELECT id FROM profiles LIMIT 1)
    )
ON CONFLICT DO NOTHING;

-- ====================================
-- VISTAS ÚTILES
-- ====================================

-- Vista completa de investigaciones con estadísticas
CREATE OR REPLACE VIEW investigaciones_completas AS
SELECT 
    i.*,
    e.nombre as empresa_nombre,
    p.full_name as creador_nombre,
    p.email as creador_email,
    (
        SELECT COUNT(*) 
        FROM sesiones s 
        WHERE s.investigacion_id = i.id
    ) as total_sesiones,
    (
        SELECT COUNT(*) 
        FROM sesiones s 
        WHERE s.investigacion_id = i.id AND s.estado = 'completada'
    ) as sesiones_completadas_real
FROM investigaciones i
LEFT JOIN empresas e ON i.empresa_id = e.id
LEFT JOIN profiles p ON i.creador_id = p.id;

-- Vista de sesiones con detalles
CREATE OR REPLACE VIEW sesiones_completas AS
SELECT 
    s.*,
    i.titulo as investigacion_titulo,
    i.estado as investigacion_estado,
    p.full_name as moderador_nombre,
    p.email as moderador_email
FROM sesiones s
LEFT JOIN investigaciones i ON s.investigacion_id = i.id
LEFT JOIN profiles p ON s.moderador_id = p.id;

-- ====================================
-- VERIFICACIÓN FINAL
-- ====================================

-- Mostrar resumen de tablas creadas
SELECT 
    'Tablas creadas para módulo investigaciones:' as info,
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as columnas
FROM information_schema.tables t
WHERE table_name IN ('investigaciones', 'sesiones', 'empresas')
ORDER BY table_name; 