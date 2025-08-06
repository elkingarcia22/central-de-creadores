-- ====================================
-- INSERTAR DATOS EN ROLES_EMPRESA
-- ====================================

-- Verificar que la tabla está vacía
SELECT 'Registros actuales en roles_empresa:' as info, COUNT(*) as total FROM roles_empresa;

-- Insertar roles de empresa comunes
INSERT INTO roles_empresa (nombre, activo) VALUES
-- Ejecutivos
('CEO', true),
('CTO', true),
('CFO', true),
('CMO', true),
('COO', true),
('CHRO', true),

-- Directores y Gerentes
('Director de Producto', true),
('Director de Ingeniería', true),
('Director de Diseño', true),
('Director de Ventas', true),
('Gerente de Producto', true),
('Gerente de Proyecto', true),
('Gerente de Marketing', true),
('Gerente de Operaciones', true),

-- Roles de Producto y Diseño
('Product Manager', true),
('Product Owner', true),
('UX Designer', true),
('UI Designer', true),
('UX Researcher', true),
('Product Designer', true),
('Design System Manager', true),

-- Roles Técnicos
('Desarrollador Frontend', true),
('Desarrollador Backend', true),
('Desarrollador Full Stack', true),
('Arquitecto de Software', true),
('DevOps Engineer', true),
('QA Engineer', true),
('Data Scientist', true),
('Data Analyst', true),

-- Roles de Marketing y Ventas
('Marketing Manager', true),
('Content Manager', true),
('Social Media Manager', true),
('Sales Manager', true),
('Account Manager', true),
('Business Development', true),

-- Roles de Operaciones
('Operations Manager', true),
('HR Manager', true),
('Finance Manager', true),
('Legal Counsel', true),
('Compliance Officer', true),

-- Roles Junior
('Junior Developer', true),
('Junior Designer', true),
('Junior Product Manager', true),
('Junior Analyst', true),
('Intern', true),

-- Roles Especializados
('Scrum Master', true),
('Project Coordinator', true),
('Customer Success Manager', true),
('Support Specialist', true),
('Technical Writer', true),

-- Roles de Consultoría
('Consultor', true),
('Freelancer', true),
('Contractor', true)

ON CONFLICT (nombre) DO NOTHING;

-- Verificar que se insertaron los datos
SELECT 'Registros después de insertar:' as info, COUNT(*) as total FROM roles_empresa;

-- Mostrar algunos ejemplos
SELECT 'Primeros 10 roles insertados:' as info, nombre FROM roles_empresa ORDER BY nombre LIMIT 10;

-- Verificar que están activos
SELECT 'Roles activos:' as info, COUNT(*) as total_activos FROM roles_empresa WHERE activo = true; 