-- ====================================
-- CREAR TODAS LAS TABLAS DE CATÁLOGOS PARA LIBRETOS
-- ====================================

-- 1. TABLA PLATAFORMAS
CREATE TABLE IF NOT EXISTS plataformas_cat (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABLA INDUSTRIAS
CREATE TABLE IF NOT EXISTS industrias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLA MODALIDADES
CREATE TABLE IF NOT EXISTS modalidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABLA TAMAÑO EMPRESA
CREATE TABLE IF NOT EXISTS tamano_empresa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL UNIQUE,
    descripcion TEXT,
    rango_empleados VARCHAR(100),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABLA LIBRETOS_INVESTIGACION
CREATE TABLE IF NOT EXISTS libretos_investigacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigacion_id UUID NOT NULL,
    
    -- Contenido del libreto
    problema_situacion TEXT,
    hipotesis TEXT,
    objetivos TEXT,
    resultado_esperado TEXT,
    productos_recomendaciones TEXT,
    
    -- Referencias a catálogos
    plataforma_id UUID REFERENCES plataformas_cat(id),
    tipo_prueba TEXT,
    rol_empresa_id UUID REFERENCES roles_empresa(id),
    industria_id UUID REFERENCES industrias(id),
    pais TEXT,
    modalidad_id UUID REFERENCES modalidades(id),
    tamano_empresa_id UUID REFERENCES tamano_empresa(id),
    
    -- Configuración de la sesión
    numero_participantes INTEGER,
    nombre_sesion TEXT,
    usuarios_participantes UUID[],
    duracion_estimada INTEGER, -- en minutos
    descripcion_general TEXT,
    
    -- Metadatos
    creado_por UUID,
    creado_el TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_el TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- INSERTAR DATOS DE EJEMPLO
-- ====================================

-- PLATAFORMAS
INSERT INTO plataformas_cat (nombre, descripcion) VALUES
('Web Desktop', 'Aplicación web para escritorio'),
('Web Mobile', 'Aplicación web para móvil'),
('iOS App', 'Aplicación nativa para iOS'),
('Android App', 'Aplicación nativa para Android'),
('Desktop App', 'Aplicación de escritorio'),
('API/Backend', 'Servicios y APIs backend'),
('Otro', 'Otra plataforma no especificada')
ON CONFLICT (nombre) DO NOTHING;

-- INDUSTRIAS
INSERT INTO industrias (nombre, descripcion) VALUES
('Tecnología', 'Empresas de tecnología y software'),
('Fintech', 'Tecnología financiera'),
('E-commerce', 'Comercio electrónico'),
('Salud', 'Sector salud y medicina'),
('Educación', 'Sector educativo'),
('Gobierno', 'Sector público y gubernamental'),
('Retail', 'Comercio minorista'),
('Banca', 'Sector bancario'),
('Seguros', 'Sector asegurador'),
('Manufactura', 'Sector manufacturero'),
('Logística', 'Transporte y logística'),
('Telecomunicaciones', 'Sector telecomunicaciones'),
('Energía', 'Sector energético'),
('Inmobiliario', 'Sector inmobiliario'),
('Entretenimiento', 'Entretenimiento y medios'),
('Turismo', 'Sector turístico'),
('Consultoría', 'Servicios de consultoría'),
('Startup', 'Empresas emergentes'),
('ONG', 'Organizaciones sin fines de lucro'),
('Otro', 'Otra industria no especificada')
ON CONFLICT (nombre) DO NOTHING;

-- MODALIDADES
INSERT INTO modalidades (nombre, descripcion) VALUES
('Presencial', 'Sesión presencial en oficina'),
('Remoto', 'Sesión completamente remota'),
('Híbrido', 'Sesión mixta presencial y remota'),
('Asíncrono', 'Actividades asíncronas'),
('Grabado', 'Sesión grabada para revisión posterior')
ON CONFLICT (nombre) DO NOTHING;

-- TAMAÑO EMPRESA
INSERT INTO tamano_empresa (nombre, descripcion, rango_empleados) VALUES
('Startup', 'Empresa emergente', '1-10 empleados'),
('Pequeña', 'Empresa pequeña', '11-50 empleados'),
('Mediana', 'Empresa mediana', '51-200 empleados'),
('Grande', 'Empresa grande', '201-1000 empleados'),
('Enterprise', 'Empresa corporativa', '1000+ empleados'),
('Freelancer', 'Trabajador independiente', '1 empleado'),
('Agencia', 'Agencia de servicios', '5-100 empleados')
ON CONFLICT (nombre) DO NOTHING;

-- ====================================
-- CREAR ÍNDICES PARA MEJORAR RENDIMIENTO
-- ====================================

-- Índices para plataformas_cat
CREATE INDEX IF NOT EXISTS idx_plataformas_cat_nombre ON plataformas_cat(nombre);
CREATE INDEX IF NOT EXISTS idx_plataformas_cat_activo ON plataformas_cat(activo);

-- Índices para industrias
CREATE INDEX IF NOT EXISTS idx_industrias_nombre ON industrias(nombre);
CREATE INDEX IF NOT EXISTS idx_industrias_activo ON industrias(activo);

-- Índices para modalidades
CREATE INDEX IF NOT EXISTS idx_modalidades_nombre ON modalidades(nombre);
CREATE INDEX IF NOT EXISTS idx_modalidades_activo ON modalidades(activo);

-- Índices para tamano_empresa
CREATE INDEX IF NOT EXISTS idx_tamano_empresa_nombre ON tamano_empresa(nombre);
CREATE INDEX IF NOT EXISTS idx_tamano_empresa_activo ON tamano_empresa(activo);

-- Índices para libretos_investigacion
CREATE INDEX IF NOT EXISTS idx_libretos_investigacion_id ON libretos_investigacion(investigacion_id);
CREATE INDEX IF NOT EXISTS idx_libretos_plataforma_id ON libretos_investigacion(plataforma_id);
CREATE INDEX IF NOT EXISTS idx_libretos_rol_empresa_id ON libretos_investigacion(rol_empresa_id);
CREATE INDEX IF NOT EXISTS idx_libretos_industria_id ON libretos_investigacion(industria_id);
CREATE INDEX IF NOT EXISTS idx_libretos_modalidad_id ON libretos_investigacion(modalidad_id);
CREATE INDEX IF NOT EXISTS idx_libretos_tamano_empresa_id ON libretos_investigacion(tamano_empresa_id);
CREATE INDEX IF NOT EXISTS idx_libretos_creado_por ON libretos_investigacion(creado_por);

-- ====================================
-- VERIFICAR DATOS INSERTADOS
-- ====================================

SELECT 'Plataformas creadas:' as info, COUNT(*) as total FROM plataformas_cat;
SELECT 'Industrias creadas:' as info, COUNT(*) as total FROM industrias;
SELECT 'Modalidades creadas:' as info, COUNT(*) as total FROM modalidades;
SELECT 'Tamaños de empresa creados:' as info, COUNT(*) as total FROM tamano_empresa;

-- Mostrar algunos ejemplos
SELECT 'Ejemplos de plataformas:' as info, STRING_AGG(nombre, ', ') as ejemplos FROM (SELECT nombre FROM plataformas_cat LIMIT 5) t;
SELECT 'Ejemplos de industrias:' as info, STRING_AGG(nombre, ', ') as ejemplos FROM (SELECT nombre FROM industrias LIMIT 5) t;
SELECT 'Ejemplos de modalidades:' as info, STRING_AGG(nombre, ', ') as ejemplos FROM (SELECT nombre FROM modalidades LIMIT 5) t;
SELECT 'Ejemplos de tamaños:' as info, STRING_AGG(nombre, ', ') as ejemplos FROM (SELECT nombre FROM tamano_empresa LIMIT 5) t; 