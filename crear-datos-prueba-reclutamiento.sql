-- Script para crear datos de prueba para el módulo de reclutamiento

-- 1. Insertar estados de reclutamiento
INSERT INTO estado_reclutamiento_cat (id, nombre, color, activo, orden) VALUES
('est_001', 'Por iniciar', '#6B7280', true, 1),
('est_002', 'En progreso', '#3B82F6', true, 2),
('est_003', 'Agendada', '#F59E0B', true, 3),
('est_004', 'Completada', '#10B981', true, 4),
('est_005', 'Cancelada', '#EF4444', true, 5)
ON CONFLICT (id) DO NOTHING;

-- 2. Insertar usuarios de prueba si no existen
INSERT INTO usuarios (id, name, email, role) VALUES
('usr_001', 'Ana García', 'ana.garcia@empresa.com', 'investigador'),
('usr_002', 'Carlos López', 'carlos.lopez@empresa.com', 'investigador'),
('usr_003', 'María Rodríguez', 'maria.rodriguez@empresa.com', 'investigador'),
('usr_004', 'Juan Pérez', 'juan.perez@empresa.com', 'investigador')
ON CONFLICT (id) DO NOTHING;

-- 3. Insertar investigaciones con estado de reclutamiento
INSERT INTO investigaciones (id, nombre, estado, fecha_inicio, fecha_fin, estado_reclutamiento, responsable_id, implementador_id) VALUES
('inv_001', 'Estudio de Usabilidad App Móvil', 'en_progreso', '2024-01-15', '2024-03-15', 'est_002', 'usr_001', 'usr_002'),
('inv_002', 'Test de Concepto Nuevo Producto', 'en_borrador', '2024-02-01', '2024-04-01', 'est_001', 'usr_003', 'usr_001'),
('inv_003', 'Validación de Prototipo', 'en_progreso', '2024-01-20', '2024-02-20', 'est_003', 'usr_002', 'usr_004'),
('inv_004', 'Análisis de Competencia', 'pausado', '2024-02-10', '2024-05-10', 'est_004', 'usr_001', 'usr_003'),
('inv_005', 'Test de Preferencias', 'en_progreso', '2024-01-25', '2024-03-25', 'est_002', 'usr_004', 'usr_002')
ON CONFLICT (id) DO NOTHING;

-- 4. Insertar libretos para las investigaciones
INSERT INTO libretos_investigacion (id, investigacion_id, titulo, descripcion, numero_participantes) VALUES
('lib_001', 'inv_001', 'Libreto Usabilidad App', 'Guía para evaluar la usabilidad de la aplicación móvil', 15),
('lib_002', 'inv_002', 'Libreto Test Concepto', 'Protocolo para validar el concepto del nuevo producto', 20),
('lib_003', 'inv_003', 'Libreto Validación Prototipo', 'Instrucciones para la validación del prototipo', 12),
('lib_004', 'inv_004', 'Libreto Análisis Competencia', 'Metodología para el análisis de competencia', 8),
('lib_005', 'inv_005', 'Libreto Test Preferencias', 'Protocolo para evaluar preferencias de usuarios', 18)
ON CONFLICT (id) DO NOTHING;

-- Verificar que los datos se insertaron correctamente
SELECT 
    i.id,
    i.nombre,
    i.estado,
    i.estado_reclutamiento,
    erc.nombre as estado_reclutamiento_nombre,
    u1.name as responsable,
    u2.name as implementador,
    l.titulo as libreto_titulo,
    l.numero_participantes
FROM investigaciones i
LEFT JOIN estado_reclutamiento_cat erc ON i.estado_reclutamiento = erc.id
LEFT JOIN usuarios u1 ON i.responsable_id = u1.id
LEFT JOIN usuarios u2 ON i.implementador_id = u2.id
LEFT JOIN libretos_investigacion l ON i.id = l.investigacion_id
WHERE i.estado_reclutamiento IS NOT NULL
ORDER BY i.fecha_inicio; 