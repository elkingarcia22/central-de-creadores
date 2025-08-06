-- Script seguro para poblar la tabla paises con datos del archivo paises_rows.sql
-- Maneja duplicados usando ON CONFLICT

-- Primero verificamos el estado actual de la tabla
SELECT 'Estado actual de la tabla paises:' as mensaje;
SELECT COUNT(*) as total_paises FROM paises;

-- Ejecutamos el INSERT con ON CONFLICT para manejar duplicados
INSERT INTO "public"."paises" ("id", "nombre", "activo") VALUES 
('0ee98b63-c1dd-435e-8f95-7227ed0547cd', 'Uruguay', 'true'), 
('312b302f-4648-442f-a846-9df622bcf846', 'México', 'true'), 
('35395f8d-a5e8-4b82-9201-cca45c4cf971', 'Perú', 'true'), 
('3fd6c620-78d3-4eca-98cb-c802f1b10505', 'Costa Rica', 'true'), 
('671843b0-103d-4951-a596-b9a0c25d1fff', 'Brasil', 'true'), 
('684c41d3-6454-4a72-a2f4-66ec5e3a5051', 'Argentina', 'true'), 
('73a1b9ca-1bb2-4637-803b-b018fe6469fc', 'Guatemala', 'true'), 
('7de99f4a-b81e-42d5-b75b-ec1e719bc4ba', 'Colombia', 'true'), 
('80359244-2827-42e2-b42a-75220729e255', 'República Dominicana', 'true'), 
('8ba5e8b8-d632-4b32-8eb2-a78884aa360c', 'Estados Unidos', 'true'), 
('94dfd31e-b6fc-408a-b902-cbd7f28b6cb5', 'Ecuador', 'true'), 
('ac7f463f-cad9-40f6-a1ff-8f1bfc6acd57', 'Portugal', 'true'), 
('bcc4bc54-e12c-4d27-b4f6-2d580f873b78', 'El Salvador', 'true'), 
('c3812504-775e-4566-abce-48a0f67d747b', 'Panamá', 'true'), 
('cb4c3679-6703-41db-9aa5-0efa1e44f349', 'España', 'true'), 
('d275a728-9b74-4f24-8296-93a183ae687a', 'Chile', 'true'), 
('ef8daa40-2634-4808-b705-0ea8fcf9bc15', 'Paraguay', 'true')
ON CONFLICT (id) DO UPDATE SET 
    nombre = EXCLUDED.nombre,
    activo = EXCLUDED.activo;

-- Verificamos que los datos están correctos
SELECT 'Datos verificados correctamente:' as mensaje;
SELECT COUNT(*) as total_paises_final FROM paises;

-- Mostramos todos los países para verificar
SELECT 'Todos los países disponibles:' as mensaje;
SELECT id, nombre, activo FROM paises ORDER BY nombre;

-- Verificamos que RLS esté deshabilitado para que la app pueda acceder
SELECT 'Estado de RLS en tabla paises:' as mensaje;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'paises';

-- Deshabilitamos RLS para que la aplicación pueda acceder
ALTER TABLE paises DISABLE ROW LEVEL SECURITY;

-- Verificamos que RLS se deshabilitó correctamente
SELECT 'Estado de RLS después de deshabilitar:' as mensaje;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'paises'; 