-- ====================================
-- CREAR TABLA ROLES_EMPRESA
-- ====================================

-- Crear tabla roles_empresa
CREATE TABLE IF NOT EXISTS roles_empresa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL UNIQUE,
    descripcion TEXT,
    categoria VARCHAR(100), -- Ej: 'Ejecutivo', 'Operativo', 'Técnico', etc.
    nivel VARCHAR(50), -- Ej: 'Junior', 'Senior', 'Director', etc.
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_roles_empresa_nombre ON roles_empresa(nombre);
CREATE INDEX IF NOT EXISTS idx_roles_empresa_categoria ON roles_empresa(categoria);
CREATE INDEX IF NOT EXISTS idx_roles_empresa_activo ON roles_empresa(activo);

-- Insertar roles de empresa comunes
INSERT INTO roles_empresa (nombre, descripcion, categoria, nivel) VALUES
-- Ejecutivos
('CEO', 'Director Ejecutivo', 'Ejecutivo', 'C-Level'),
('CTO', 'Director de Tecnología', 'Ejecutivo', 'C-Level'),
('CFO', 'Director Financiero', 'Ejecutivo', 'C-Level'),
('CMO', 'Director de Marketing', 'Ejecutivo', 'C-Level'),
('COO', 'Director de Operaciones', 'Ejecutivo', 'C-Level'),
('CHRO', 'Director de Recursos Humanos', 'Ejecutivo', 'C-Level'),

-- Directores y Gerentes
('Director de Producto', 'Responsable de la estrategia de producto', 'Directivo', 'Director'),
('Director de Ingeniería', 'Responsable del equipo de desarrollo', 'Directivo', 'Director'),
('Director de Diseño', 'Responsable del equipo de diseño', 'Directivo', 'Director'),
('Director de Ventas', 'Responsable del equipo de ventas', 'Directivo', 'Director'),
('Gerente de Producto', 'Gestión de productos específicos', 'Gerencial', 'Gerente'),
('Gerente de Proyecto', 'Gestión de proyectos', 'Gerencial', 'Gerente'),
('Gerente de Marketing', 'Gestión de campañas de marketing', 'Gerencial', 'Gerente'),
('Gerente de Operaciones', 'Gestión de operaciones diarias', 'Gerencial', 'Gerente'),

-- Roles de Producto y Diseño
('Product Manager', 'Gestión de productos', 'Producto', 'Senior'),
('Product Owner', 'Propietario de producto', 'Producto', 'Senior'),
('UX Designer', 'Diseñador de experiencia de usuario', 'Diseño', 'Senior'),
('UI Designer', 'Diseñador de interfaz de usuario', 'Diseño', 'Senior'),
('UX Researcher', 'Investigador de experiencia de usuario', 'Investigación', 'Senior'),
('Product Designer', 'Diseñador de producto', 'Diseño', 'Senior'),
('Design System Manager', 'Responsable del sistema de diseño', 'Diseño', 'Senior'),

-- Roles Técnicos
('Desarrollador Frontend', 'Desarrollo de interfaces de usuario', 'Técnico', 'Senior'),
('Desarrollador Backend', 'Desarrollo de servicios y APIs', 'Técnico', 'Senior'),
('Desarrollador Full Stack', 'Desarrollo completo de aplicaciones', 'Técnico', 'Senior'),
('Arquitecto de Software', 'Diseño de arquitectura de sistemas', 'Técnico', 'Senior'),
('DevOps Engineer', 'Operaciones y desarrollo', 'Técnico', 'Senior'),
('QA Engineer', 'Aseguramiento de calidad', 'Técnico', 'Senior'),
('Data Scientist', 'Científico de datos', 'Técnico', 'Senior'),
('Data Analyst', 'Analista de datos', 'Técnico', 'Senior'),

-- Roles de Marketing y Ventas
('Marketing Manager', 'Gestión de marketing', 'Marketing', 'Senior'),
('Content Manager', 'Gestión de contenido', 'Marketing', 'Senior'),
('Social Media Manager', 'Gestión de redes sociales', 'Marketing', 'Senior'),
('Sales Manager', 'Gestión de ventas', 'Ventas', 'Senior'),
('Account Manager', 'Gestión de cuentas', 'Ventas', 'Senior'),
('Business Development', 'Desarrollo de negocios', 'Ventas', 'Senior'),

-- Roles de Operaciones
('Operations Manager', 'Gestión de operaciones', 'Operaciones', 'Senior'),
('HR Manager', 'Gestión de recursos humanos', 'Recursos Humanos', 'Senior'),
('Finance Manager', 'Gestión financiera', 'Finanzas', 'Senior'),
('Legal Counsel', 'Asesoría legal', 'Legal', 'Senior'),
('Compliance Officer', 'Oficial de cumplimiento', 'Legal', 'Senior'),

-- Roles Junior
('Junior Developer', 'Desarrollador junior', 'Técnico', 'Junior'),
('Junior Designer', 'Diseñador junior', 'Diseño', 'Junior'),
('Junior Product Manager', 'Product Manager junior', 'Producto', 'Junior'),
('Junior Analyst', 'Analista junior', 'Análisis', 'Junior'),
('Intern', 'Practicante', 'Operativo', 'Intern'),

-- Roles Especializados
('Scrum Master', 'Facilitador de metodologías ágiles', 'Gestión', 'Senior'),
('Project Coordinator', 'Coordinador de proyectos', 'Gestión', 'Junior'),
('Customer Success Manager', 'Gestión de éxito del cliente', 'Cliente', 'Senior'),
('Support Specialist', 'Especialista en soporte', 'Soporte', 'Junior'),
('Technical Writer', 'Escritor técnico', 'Documentación', 'Senior'),

-- Roles de Consultoría
('Consultor', 'Consultor externo', 'Consultoría', 'Senior'),
('Freelancer', 'Trabajador independiente', 'Consultoría', 'Variable'),
('Contractor', 'Contratista', 'Consultoría', 'Variable')

ON CONFLICT (nombre) DO NOTHING;

-- Verificar que se insertaron los datos
SELECT 
    'Roles de empresa creados:' as info,
    COUNT(*) as total_roles,
    COUNT(DISTINCT categoria) as categorias,
    COUNT(DISTINCT nivel) as niveles
FROM roles_empresa;

-- Mostrar algunos ejemplos por categoría
SELECT 
    categoria,
    COUNT(*) as cantidad_roles,
    STRING_AGG(nombre, ', ' ORDER BY nombre) as ejemplos
FROM roles_empresa
GROUP BY categoria
ORDER BY cantidad_roles DESC; 