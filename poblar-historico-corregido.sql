-- ====================================
-- POBLAR TABLAS DE HISTORIAL CORREGIDAS
-- ====================================
-- Insertar datos de ejemplo en las tablas corregidas

-- 1. Poblar historial_participacion_empresas (versión corregida)
INSERT INTO historial_participacion_empresas (
    empresa_id,
    investigacion_id,
    participante_id,
    reclutamiento_id,
    fecha_participacion,
    duracion_sesion,
    estado_sesion,
    creado_por
) VALUES 
-- Empresa 1: Participaciones recientes
('56ae11ec-f6b4-4066-9414-e51adfbebee2', '5a832297-4cca-4bad-abe6-3aad99b8b5f3', '9155b800-f786-46d7-9294-bb385434d042', '55037174-e784-49ab-b86a-d466340f3936', NOW() - INTERVAL '1 day', 60, 'completada', '37b272a8-8baa-493c-8877-f14d031e22a1'),
('56ae11ec-f6b4-4066-9414-e51adfbebee2', '5a832297-4cca-4bad-abe6-3aad99b8b5f3', '9155b800-f786-46d7-9294-bb385434d042', '58045a42-49b5-403d-a4ab-fba403e6011d', NOW() - INTERVAL '2 days', 60, 'completada', '37b272a8-8baa-493c-8877-f14d031e22a1'),
('56ae11ec-f6b4-4066-9414-e51adfbebee2', '5a832297-4cca-4bad-abe6-3aad99b8b5f3', '9155b800-f786-46d7-9294-bb385434d042', '0e45059c-753b-47c6-bc2e-81e5eedd5dff', NOW() - INTERVAL '7 days', 60, 'completada', '37b272a8-8baa-493c-8877-f14d031e22a1'),

-- Empresa 2: Participaciones variadas
('2c3a7110-409a-4770-b519-63982b1385bb', '5a832297-4cca-4bad-abe6-3aad99b8b5f3', 'af4eb891-2a6e-44e0-84d3-b00592775c08', '5154af23-3ea5-407f-b788-6a98202097e7', NOW() - INTERVAL '3 days', 60, 'completada', '37b272a8-8baa-493c-8877-f14d031e22a1'),
('2c3a7110-409a-4770-b519-63982b1385bb', '5a832297-4cca-4bad-abe6-3aad99b8b5f3', 'af4eb891-2a6e-44e0-84d3-b00592775c08', '0e292dc9-3b44-4968-a23b-b94f9d83de69', NOW() - INTERVAL '5 days', 60, 'cancelada', '37b272a8-8baa-493c-8877-f14d031e22a1'),
('2c3a7110-409a-4770-b519-63982b1385bb', '5a832297-4cca-4bad-abe6-3aad99b8b5f3', 'af4eb891-2a6e-44e0-84d3-b00592775c08', 'cfd5fc1e-7f03-4371-aeb0-46779f7774b1', NOW() - INTERVAL '10 days', 60, 'reprogramada', '37b272a8-8baa-493c-8877-f14d031e22a1'),

-- Empresa 3: Participaciones antiguas
('48a2bf74-7ff2-4d45-86f1-bd8993c0dd24', '5a832297-4cca-4bad-abe6-3aad99b8b5f3', '55037174-e784-49ab-b86a-d466340f3936', '21f5868f-9bea-4748-bda2-864c5e21a416', NOW() - INTERVAL '15 days', 60, 'completada', '37b272a8-8baa-493c-8877-f14d031e22a1'),
('48a2bf74-7ff2-4d45-86f1-bd8993c0dd24', '5a832297-4cca-4bad-abe6-3aad99b8b5f3', '55037174-e784-49ab-b86a-d466340f3936', '5f4434ab-b657-45e9-8815-031e7174d61b', NOW() - INTERVAL '20 days', 60, 'completada', '37b272a8-8baa-493c-8877-f14d031e22a1'),
('48a2bf74-7ff2-4d45-86f1-bd8993c0dd24', '5a832297-4cca-4bad-abe6-3aad99b8b5f3', '55037174-e784-49ab-b86a-d466340f3936', 'e3876c64-6ab8-472c-97ff-a633afe1291e', NOW() - INTERVAL '25 days', 60, 'completada', '37b272a8-8baa-493c-8877-f14d031e22a1');

-- 2. Poblar historial_participacion_participantes (versión corregida)
INSERT INTO historial_participacion_participantes (
    participante_id,
    investigacion_id,
    reclutamiento_id,
    empresa_id,
    fecha_participacion,
    duracion_sesion,
    estado_sesion,
    creado_por
) VALUES 
-- Participante 1: Participaciones recientes
('9155b800-f786-46d7-9294-bb385434d042', '5a832297-4cca-4bad-abe6-3aad99b8b5f3', '55037174-e784-49ab-b86a-d466340f3936', '56ae11ec-f6b4-4066-9414-e51adfbebee2', NOW() - INTERVAL '1 day', 60, 'completada', '37b272a8-8baa-493c-8877-f14d031e22a1'),
('9155b800-f786-46d7-9294-bb385434d042', '5a832297-4cca-4bad-abe6-3aad99b8b5f3', '58045a42-49b5-403d-a4ab-fba403e6011d', '56ae11ec-f6b4-4066-9414-e51adfbebee2', NOW() - INTERVAL '2 days', 60, 'completada', '37b272a8-8baa-493c-8877-f14d031e22a1'),
('9155b800-f786-46d7-9294-bb385434d042', '5a832297-4cca-4bad-abe6-3aad99b8b5f3', '0e45059c-753b-47c6-bc2e-81e5eedd5dff', '56ae11ec-f6b4-4066-9414-e51adfbebee2', NOW() - INTERVAL '7 days', 60, 'completada', '37b272a8-8baa-493c-8877-f14d031e22a1'),

-- Participante 2: Participaciones variadas
('af4eb891-2a6e-44e0-84d3-b00592775c08', '5a832297-4cca-4bad-abe6-3aad99b8b5f3', '5154af23-3ea5-407f-b788-6a98202097e7', '2c3a7110-409a-4770-b519-63982b1385bb', NOW() - INTERVAL '3 days', 60, 'completada', '37b272a8-8baa-493c-8877-f14d031e22a1'),
('af4eb891-2a6e-44e0-84d3-b00592775c08', '5a832297-4cca-4bad-abe6-3aad99b8b5f3', '0e292dc9-3b44-4968-a23b-b94f9d83de69', '2c3a7110-409a-4770-b519-63982b1385bb', NOW() - INTERVAL '5 days', 60, 'cancelada', '37b272a8-8baa-493c-8877-f14d031e22a1'),
('af4eb891-2a6e-44e0-84d3-b00592775c08', '5a832297-4cca-4bad-abe6-3aad99b8b5f3', 'cfd5fc1e-7f03-4371-aeb0-46779f7774b1', '2c3a7110-409a-4770-b519-63982b1385bb', NOW() - INTERVAL '10 days', 60, 'reprogramada', '37b272a8-8baa-493c-8877-f14d031e22a1'),

-- Participante 3: Participaciones antiguas
('55037174-e784-49ab-b86a-d466340f3936', '5a832297-4cca-4bad-abe6-3aad99b8b5f3', '21f5868f-9bea-4748-bda2-864c5e21a416', '48a2bf74-7ff2-4d45-86f1-bd8993c0dd24', NOW() - INTERVAL '15 days', 60, 'completada', '37b272a8-8baa-493c-8877-f14d031e22a1'),
('55037174-e784-49ab-b86a-d466340f3936', '5a832297-4cca-4bad-abe6-3aad99b8b5f3', '5f4434ab-b657-45e9-8815-031e7174d61b', '48a2bf74-7ff2-4d45-86f1-bd8993c0dd24', NOW() - INTERVAL '20 days', 60, 'completada', '37b272a8-8baa-493c-8877-f14d031e22a1'),
('55037174-e784-49ab-b86a-d466340f3936', '5a832297-4cca-4bad-abe6-3aad99b8b5f3', 'e3876c64-6ab8-472c-97ff-a633afe1291e', '48a2bf74-7ff2-4d45-86f1-bd8993c0dd24', NOW() - INTERVAL '25 days', 60, 'completada', '37b272a8-8baa-493c-8877-f14d031e22a1');

-- 3. Verificar datos insertados
SELECT 
    '=== DATOS INSERTADOS ===' as info;

SELECT 
    'historial_participacion_empresas' as tabla,
    COUNT(*) as total_registros
FROM historial_participacion_empresas
UNION ALL
SELECT 
    'historial_participacion_participantes' as tabla,
    COUNT(*) as total_registros
FROM historial_participacion_participantes;

-- 4. Mostrar estadísticas por estado
SELECT 
    '=== ESTADÍSTICAS POR ESTADO ===' as info;

SELECT 
    'historial_empresas' as tabla,
    estado_sesion,
    COUNT(*) as total
FROM historial_participacion_empresas
GROUP BY estado_sesion
UNION ALL
SELECT 
    'historial_participantes' as tabla,
    estado_sesion,
    COUNT(*) as total
FROM historial_participacion_participantes
GROUP BY estado_sesion;

-- 5. Mostrar ejemplo de datos
SELECT 
    '=== EJEMPLO DE DATOS ===' as info;

SELECT 
    'Empresas' as tipo,
    empresa_id,
    fecha_participacion,
    estado_sesion,
    duracion_sesion
FROM historial_participacion_empresas
LIMIT 3
UNION ALL
SELECT 
    'Participantes' as tipo,
    participante_id,
    fecha_participacion,
    estado_sesion,
    duracion_sesion
FROM historial_participacion_participantes
LIMIT 3; 