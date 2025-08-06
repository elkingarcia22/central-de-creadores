-- ================================================
-- SOLUCIÓN PARA RLS EN TABLA PERIODO
-- ================================================

-- Opción 1: Deshabilitar RLS temporalmente (MÁS SIMPLE)
-- Ejecutar esto si quieres acceso completo sin políticas
ALTER TABLE periodo DISABLE ROW LEVEL SECURITY;

-- Verificar que RLS está deshabilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'periodo';

-- ================================================
-- Opción 2: Crear políticas RLS (MÁS SEGURO)
-- Solo ejecutar si prefieres mantener RLS habilitado
-- ================================================

/*
-- Habilitar RLS si no está habilitado
ALTER TABLE periodo ENABLE ROW LEVEL SECURITY;

-- Crear política para permitir lectura pública
CREATE POLICY "Enable read access for all users" 
ON periodo FOR SELECT USING (true);

-- Crear política para permitir inserción (opcional, solo si necesitas insertar desde la app)
CREATE POLICY "Enable insert for authenticated users" 
ON periodo FOR INSERT WITH CHECK (true);

-- Verificar políticas creadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'periodo';
*/

-- ================================================
-- INSERTAR DATOS DE EJEMPLO
-- ================================================

-- Insertar períodos de ejemplo (basados en tu captura)
INSERT INTO periodo (etiqueta, ano, trimestre, fecha_inicio, fecha_fin) VALUES
('Q1 2028', 2028, 'Q1', '2028-01-01 00:00:00+00', '2028-03-31 23:59:59+00'),
('Q4 2027', 2027, 'Q4', '2027-10-01 00:00:00+00', '2027-12-31 23:59:59+00'),
('Q3 2027', 2027, 'Q3', '2027-07-01 00:00:00+00', '2027-09-30 23:59:59+00'),
('Q2 2027', 2027, 'Q2', '2027-04-01 00:00:00+00', '2027-06-30 23:59:59+00'),
('Q1 2027', 2027, 'Q1', '2027-01-01 00:00:00+00', '2027-03-31 23:59:59+00'),
('Q4 2026', 2026, 'Q4', '2026-10-01 00:00:00+00', '2026-12-31 23:59:59+00'),
('Q3 2026', 2026, 'Q3', '2026-07-01 00:00:00+00', '2026-09-30 23:59:59+00'),
('Q2 2026', 2026, 'Q2', '2026-04-01 00:00:00+00', '2026-06-30 23:59:59+00'),
('Q1 2026', 2026, 'Q1', '2026-01-01 00:00:00+00', '2026-03-31 23:59:59+00'),
('Q4 2025', 2025, 'Q4', '2025-10-01 00:00:00+00', '2025-12-31 23:59:59+00'),
('Q3 2025', 2025, 'Q3', '2025-07-01 00:00:00+00', '2025-09-30 23:59:59+00'),
('Q2 2025', 2025, 'Q2', '2025-04-01 00:00:00+00', '2025-06-30 23:59:59+00'),
('Q1 2025', 2025, 'Q1', '2025-01-01 00:00:00+00', '2025-03-31 23:59:59+00'),
('Q4 2024', 2024, 'Q4', '2024-10-01 00:00:00+00', '2024-12-31 23:59:59+00'),
('Q3 2024', 2024, 'Q3', '2024-07-01 00:00:00+00', '2024-09-30 23:59:59+00'),
('Q2 2024', 2024, 'Q2', '2024-04-01 00:00:00+00', '2024-06-30 23:59:59+00');

-- Verificar que se insertaron correctamente
SELECT COUNT(*) as total_periodos FROM periodo;

-- Mostrar algunos períodos ordenados
SELECT etiqueta, ano, trimestre, fecha_inicio::date, fecha_fin::date 
FROM periodo 
ORDER BY ano DESC, trimestre DESC 
LIMIT 10;

COMMIT; 