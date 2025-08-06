-- ====================================
-- CREAR TABLA DEPARTAMENTOS (VERSIÓN FINAL)
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- Crear tabla de departamentos
CREATE TABLE IF NOT EXISTS departamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL UNIQUE,
    descripcion TEXT,
    categoria TEXT, -- Para agrupar departamentos similares
    activo BOOLEAN DEFAULT true,
    orden INTEGER DEFAULT 0, -- Para ordenar en el dropdown
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_departamentos_nombre ON departamentos(nombre);
CREATE INDEX IF NOT EXISTS idx_departamentos_activo ON departamentos(activo);
CREATE INDEX IF NOT EXISTS idx_departamentos_categoria ON departamentos(categoria);
CREATE INDEX IF NOT EXISTS idx_departamentos_orden ON departamentos(orden);

-- Habilitar RLS (Row Level Security)
ALTER TABLE departamentos ENABLE ROW LEVEL SECURITY;

-- Crear políticas básicas de RLS
CREATE POLICY "Usuarios autenticados pueden ver departamentos" ON departamentos
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden insertar departamentos" ON departamentos
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar departamentos" ON departamentos
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Insertar departamentos y áreas empresariales (SIN DUPLICADOS)
INSERT INTO departamentos (nombre, descripcion, categoria, orden) VALUES
-- DIRECCIÓN Y GESTIÓN
('Dirección General', 'Dirección ejecutiva de la empresa', 'Dirección', 1),
('Dirección Financiera', 'Gestión financiera y contable', 'Dirección', 2),
('Dirección Comercial', 'Estrategia comercial y ventas', 'Dirección', 3),
('Dirección de Operaciones', 'Gestión operativa de la empresa', 'Dirección', 4),
('Dirección de Recursos Humanos', 'Gestión del talento humano', 'Dirección', 5),
('Dirección de Tecnología', 'Estrategia tecnológica y sistemas', 'Dirección', 6),
('Dirección de Marketing', 'Estrategia de marketing y comunicación', 'Dirección', 7),
('Dirección Legal', 'Asuntos legales y cumplimiento', 'Dirección', 8),

-- ADMINISTRACIÓN Y FINANZAS
('Contabilidad', 'Contabilidad y reportes financieros', 'Administración', 10),
('Finanzas', 'Análisis financiero y tesorería', 'Administración', 11),
('Auditoría Interna', 'Auditoría y control interno', 'Administración', 12),
('Impuestos', 'Gestión tributaria', 'Administración', 13),
('Presupuesto', 'Planificación y control presupuestario', 'Administración', 14),
('Cobranzas', 'Gestión de cobranzas', 'Administración', 15),
('Pagos', 'Gestión de pagos y proveedores', 'Administración', 16),

-- RECURSOS HUMANOS
('Reclutamiento', 'Selección y contratación', 'RRHH', 20),
('Capacitación', 'Desarrollo y formación', 'RRHH', 21),
('Compensaciones', 'Salarios y beneficios', 'RRHH', 22),
('Relaciones Laborales', 'Relaciones con empleados', 'RRHH', 23),
('Bienestar', 'Bienestar y calidad de vida', 'RRHH', 24),
('Nómina', 'Procesamiento de nómina', 'RRHH', 25),
('Seguridad y Salud', 'Seguridad ocupacional', 'RRHH', 26),

-- TECNOLOGÍA E INFORMÁTICA
('Desarrollo de Software', 'Desarrollo de aplicaciones', 'Tecnología', 30),
('Infraestructura IT', 'Servidores y redes', 'Tecnología', 31),
('Soporte Técnico IT', 'Soporte a usuarios internos', 'Tecnología', 32),
('Ciberseguridad', 'Seguridad informática', 'Tecnología', 33),
('Análisis de Datos', 'Business Intelligence y Analytics', 'Tecnología', 34),
('DevOps', 'Operaciones de desarrollo', 'Tecnología', 35),
('QA y Testing', 'Control de calidad de software', 'Tecnología', 36),
('Arquitectura de Software', 'Diseño de sistemas', 'Tecnología', 37),

-- MARKETING Y COMUNICACIÓN
('Marketing Digital', 'Marketing online y redes sociales', 'Marketing', 40),
('Marketing Tradicional', 'Marketing offline y medios', 'Marketing', 41),
('Comunicación Corporativa', 'Comunicación interna y externa', 'Marketing', 42),
('Publicidad', 'Campañas publicitarias', 'Marketing', 43),
('Relaciones Públicas', 'Relaciones con medios', 'Marketing', 44),
('Branding', 'Gestión de marca', 'Marketing', 45),
('Contenido', 'Creación de contenido', 'Marketing', 46),
('SEO/SEM', 'Posicionamiento web', 'Marketing', 47),

-- VENTAS Y COMERCIAL
('Ventas Directas', 'Ventas B2B y B2C', 'Ventas', 50),
('Ventas Corporativas', 'Ventas a grandes empresas', 'Ventas', 51),
('Canales de Distribución', 'Gestión de distribuidores', 'Ventas', 52),
('Key Account Management', 'Gestión de cuentas clave', 'Ventas', 53),
('Preventa', 'Soporte técnico comercial', 'Ventas', 54),
('Postventa', 'Soporte post-venta', 'Ventas', 55),
('Customer Success', 'Éxito del cliente', 'Ventas', 56),

-- OPERACIONES Y LOGÍSTICA
('Logística', 'Gestión de distribución', 'Operaciones', 60),
('Cadena de Suministro', 'Supply Chain Management', 'Operaciones', 61),
('Almacén', 'Gestión de inventarios', 'Operaciones', 62),
('Compras', 'Gestión de compras', 'Operaciones', 63),
('Planificación', 'Planificación operativa', 'Operaciones', 64),
('Calidad', 'Control de calidad', 'Operaciones', 65),
('Mantenimiento', 'Mantenimiento de equipos', 'Operaciones', 66),

-- INVESTIGACIÓN Y DESARROLLO
('Investigación', 'Investigación de mercado', 'I+D', 70),
('Desarrollo de Productos', 'Desarrollo de nuevos productos', 'I+D', 71),
('Innovación', 'Gestión de la innovación', 'I+D', 72),
('Patentes', 'Gestión de propiedad intelectual', 'I+D', 73),
('Laboratorio', 'Investigación en laboratorio', 'I+D', 74),

-- SERVICIOS AL CLIENTE
('Atención al Cliente', 'Servicio al cliente', 'Servicios', 80),
('Soporte Técnico Cliente', 'Soporte técnico al cliente', 'Servicios', 81),
('Implementación', 'Implementación de soluciones', 'Servicios', 82),
('Consultoría', 'Servicios de consultoría', 'Servicios', 83),
('Training', 'Capacitación a clientes', 'Servicios', 84),

-- LEGAL Y COMPLIANCE
('Legal Corporativo', 'Asuntos legales corporativos', 'Legal', 90),
('Compliance', 'Cumplimiento normativo', 'Legal', 91),
('Contratos', 'Gestión de contratos', 'Legal', 92),
('Propiedad Intelectual', 'Gestión de PI', 'Legal', 93),
('Regulatorio', 'Asuntos regulatorios', 'Legal', 94),

-- PROYECTOS Y GESTIÓN
('Gestión de Proyectos', 'Coordinación de proyectos', 'Proyectos', 100),
('PMO', 'Oficina de gestión de proyectos', 'Proyectos', 101),
('Scrum Master', 'Gestión ágil de proyectos', 'Proyectos', 102),
('Product Owner', 'Propietario de producto', 'Proyectos', 103),

-- ESPECIALIZADOS
('UX/UI Design', 'Diseño de experiencia de usuario', 'Especializado', 110),
('Data Science', 'Ciencia de datos', 'Especializado', 111),
('Machine Learning', 'Aprendizaje automático', 'Especializado', 112),
('Cloud Computing', 'Computación en la nube', 'Especializado', 113),
('Mobile Development', 'Desarrollo móvil', 'Especializado', 114),
('Frontend Development', 'Desarrollo frontend', 'Especializado', 115),
('Backend Development', 'Desarrollo backend', 'Especializado', 116),
('Full Stack Development', 'Desarrollo full stack', 'Especializado', 117),

-- INDUSTRIAS ESPECÍFICAS
('Manufactura', 'Producción manufacturera', 'Industria', 120),
('Retail', 'Comercio minorista', 'Industria', 121),
('Banca', 'Servicios bancarios', 'Industria', 122),
('Seguros', 'Servicios de seguros', 'Industria', 123),
('Salud', 'Sector salud', 'Industria', 124),
('Educación', 'Sector educativo', 'Industria', 125),
('Medios', 'Medios de comunicación', 'Industria', 126),
('Turismo', 'Sector turístico', 'Industria', 127),
('Energía', 'Sector energético', 'Industria', 128),
('Telecomunicaciones', 'Sector telecomunicaciones', 'Industria', 129),

-- FUNCIONES TRANSVERSALES
('Internacional', 'Operaciones internacionales', 'Transversal', 130),
('Sostenibilidad', 'Responsabilidad social', 'Transversal', 131),
('Diversidad e Inclusión', 'Gestión de la diversidad', 'Transversal', 132),
('Transformación Digital', 'Transformación digital', 'Transversal', 133),
('Estrategia', 'Estrategia corporativa', 'Transversal', 134),
('Innovación Digital', 'Innovación tecnológica', 'Transversal', 135),

-- OTROS
('Otro', 'Otro departamento no listado', 'Otros', 999);

-- Verificar que la tabla se creó correctamente
SELECT 'Tabla departamentos creada exitosamente' as resultado;

-- Mostrar estructura de la tabla creada
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'departamentos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Mostrar algunos datos de ejemplo
SELECT 'Datos de ejemplo:' as info;
SELECT id, nombre, categoria, orden
FROM departamentos 
WHERE activo = true
ORDER BY orden, nombre
LIMIT 20;

-- Mostrar total por categoría
SELECT 'Total por categoría:' as info;
SELECT categoria, COUNT(*) as total
FROM departamentos 
WHERE activo = true
GROUP BY categoria 
ORDER BY categoria; 