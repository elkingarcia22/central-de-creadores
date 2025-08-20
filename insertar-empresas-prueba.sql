-- INSERTAR EMPRESAS DE PRUEBA
-- Para verificar que la tabla de empresas funciona correctamente

-- 1. Verificar si hay empresas existentes
SELECT 'EMPRESAS EXISTENTES' as info, COUNT(*) as total FROM empresas;

-- 2. Insertar empresas de prueba
INSERT INTO empresas (
  id,
  nombre,
  descripcion,
  industria,
  sector,
  tamano,
  pais,
  ciudad,
  direccion,
  telefono,
  email,
  sitio_web,
  kam_id,
  estado,
  activo,
  created_at,
  updated_at
) VALUES 
(
  gen_random_uuid(),
  'TechCorp Solutions',
  'Empresa líder en soluciones tecnológicas para el sector financiero',
  'Tecnología Financiera',
  'Fintech',
  'Grande',
  'Colombia',
  'Bogotá',
  'Calle 123 #45-67, Torre Empresarial',
  '+57 1 234 5678',
  'contacto@techcorp.com',
  'https://www.techcorp.com',
  NULL,
  'activa',
  true,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'HealthCare Innovations',
  'Desarrollo de software para el sector de la salud',
  'Tecnología de la Salud',
  'Salud',
  'Mediana',
  'Colombia',
  'Medellín',
  'Carrera 70 #45-89, Centro Empresarial',
  '+57 4 567 8901',
  'info@healthcareinnovations.com',
  'https://www.healthcareinnovations.com',
  NULL,
  'activa',
  true,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'EduTech Pro',
  'Plataformas educativas innovadoras para instituciones académicas',
  'Tecnología Educativa',
  'Educación',
  'Pequeña',
  'Colombia',
  'Cali',
  'Avenida 5N #23-45, Zona Rosa',
  '+57 2 345 6789',
  'contacto@edutechpro.com',
  'https://www.edutechpro.com',
  NULL,
  'activa',
  true,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'GovDigital Systems',
  'Soluciones digitales para entidades gubernamentales',
  'Tecnología Gubernamental',
  'Gobierno',
  'Grande',
  'Colombia',
  'Bogotá',
  'Calle 15 #93-47, Centro Administrativo',
  '+57 1 987 6543',
  'soporte@govdigital.com',
  'https://www.govdigital.com',
  NULL,
  'activa',
  true,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'StartUp Ventures',
  'Empresa emergente en el sector de e-commerce',
  'Comercio Electrónico',
  'Tecnología',
  'Pequeña',
  'Colombia',
  'Barranquilla',
  'Calle 84 #45-12, Centro Comercial',
  '+57 5 123 4567',
  'hello@startupventures.com',
  'https://www.startupventures.com',
  NULL,
  'prospecto',
  false,
  NOW(),
  NOW()
);

-- 3. Verificar las empresas insertadas
SELECT 
  'EMPRESAS INSERTADAS' as info,
  id,
  nombre,
  sector,
  tamano,
  activo,
  created_at
FROM empresas 
ORDER BY created_at DESC 
LIMIT 10;
