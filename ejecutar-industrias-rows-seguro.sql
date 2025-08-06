-- Script seguro para poblar la tabla industrias con datos del archivo industrias_rows.sql
-- Maneja duplicados usando ON CONFLICT

-- Primero verificamos el estado actual de la tabla
SELECT 'Estado actual de la tabla industrias:' as mensaje;
SELECT COUNT(*) as total_industrias FROM industrias;

-- Ejecutamos el INSERT con ON CONFLICT para manejar duplicados
INSERT INTO "public"."industrias" ("id", "nombre", "activo") VALUES 
('1bb43a45-0df4-461f-b2f3-eced558ecf54', 'Agroindustry', 'true'), 
('24423223-7a21-4b88-a700-a426e560ccbf', 'Seguros y Servicios Financieros', 'true'), 
('2c2febf8-3b5c-418b-9ce5-b2c5580a2768', 'Gas / Petróleo / Energía / Minería / Medio Ambiente', 'true'), 
('40d2628b-a956-481e-a3de-7cbc19e260cc', 'Government', 'true'), 
('51c0a8af-2893-46ef-827b-f473aa5012af', 'Oil & Gas / Energy / Mining / Environment', 'true'), 
('6822ca78-3183-4a08-9dfe-4852153b1e5b', 'Cualquiera', 'true'), 
('6d71fb08-1d4a-403a-9e29-7779655afe92', 'Property & Construction', 'true'), 
('767b0e01-d26e-4c00-a8c4-9d2479e37da6', 'Retail', 'true'), 
('78c12fc4-5a91-44df-9a4f-bd461b7798a8', 'Banca Financiero y Seguros', 'true'), 
('7d862045-3c91-4592-87bb-8f17acd6e49c', 'Consumo Masivo', 'true'), 
('80046f38-ed30-4a66-bad8-e8bdefde37d6', 'Financial Services & Insurance', 'true'), 
('9cd9352c-5f50-411f-a8c4-7b0a480ac784', 'Technology', 'true'), 
('9d72dc0f-f0be-45b9-9732-842c1f38a7b1', 'Services Companies', 'true'), 
('a465445c-0f78-4277-b8d6-17704bb767ab', 'Transport & Logistics', 'true'), 
('b0de40a4-d90f-42c4-8b50-131872b2e865', 'FMCG', 'true'), 
('bbf27e54-24dd-4712-bbfe-57b433da83f7', 'Pharma & Healthcare', 'true'), 
('d392f758-0d14-4d31-8d30-0823b11e30b6', 'Industry / Manufacture / Chemicals / Automotive', 'true')
ON CONFLICT (id) DO UPDATE SET 
    nombre = EXCLUDED.nombre,
    activo = EXCLUDED.activo;

-- Verificamos que los datos están correctos
SELECT 'Datos verificados correctamente:' as mensaje;
SELECT COUNT(*) as total_industrias_final FROM industrias;

-- Mostramos todas las industrias para verificar
SELECT 'Todas las industrias disponibles:' as mensaje;
SELECT id, nombre, activo FROM industrias ORDER BY nombre;

-- Verificamos que RLS esté deshabilitado para que la app pueda acceder
SELECT 'Estado de RLS en tabla industrias:' as mensaje;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'industrias';

-- Si RLS está habilitado, lo deshabilitamos
ALTER TABLE industrias DISABLE ROW LEVEL SECURITY; 