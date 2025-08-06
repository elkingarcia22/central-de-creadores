-- =====================================================
-- VERIFICAR Y CORREGIR PARTICIPANTES FRIEND AND FAMILY
-- =====================================================

-- 1. VERIFICAR ESTADO ACTUAL DE RECLUTAMIENTOS
SELECT 
    'RECLUTAMIENTOS ACTUALES' as fuente,
    id,
    investigacion_id,
    participantes_id,
    participantes_internos_id,
    participantes_friend_family_id,
    tipo_participante,
    fecha_sesion,
    estado_agendamiento
FROM reclutamientos 
ORDER BY updated_at DESC;

-- 2. VERIFICAR PARTICIPANTES FRIEND AND FAMILY CREADOS
SELECT 
    'PARTICIPANTES FRIEND AND FAMILY' as fuente,
    id,
    nombre,
    email,
    departamento_id,
    rol_empresa_id,
    created_at
FROM participantes_friend_family 
ORDER BY created_at DESC;

-- 3. VERIFICAR HISTORIAL FRIEND AND FAMILY
SELECT 
    'HISTORIAL FRIEND AND FAMILY' as fuente,
    id,
    participante_friend_family_id,
    reclutamiento_id,
    investigacion_id,
    estado_sesion,
    created_at
FROM historial_participacion_participantes_friend_family 
ORDER BY created_at DESC;

-- 4. VERIFICAR VISTA DE ESTADÍSTICAS
SELECT 
    'VISTA ESTADÍSTICAS FRIEND AND FAMILY' as fuente,
    participante_id,
    total_participaciones,
    ultima_sesion,
    ultima_investigacion
FROM vista_estadisticas_participantes_friend_family;

-- 5. CORREGIR RECLUTAMIENTO EXISTENTE (si es necesario)
-- Buscar el reclutamiento que se creó recientemente
UPDATE reclutamientos 
SET 
    tipo_participante = 'friend_family',
    participantes_friend_family_id = (
        SELECT id FROM participantes_friend_family 
        ORDER BY created_at DESC 
        LIMIT 1
    ),
    participantes_id = NULL,
    participantes_internos_id = NULL
WHERE id = (
    SELECT id FROM reclutamientos 
    WHERE participantes_friend_family_id IS NOT NULL 
    ORDER BY updated_at DESC 
    LIMIT 1
);

-- 6. VERIFICAR DESPUÉS DE LA CORRECCIÓN
SELECT 
    'RECLUTAMIENTOS DESPUÉS DE CORRECCIÓN' as fuente,
    id,
    investigacion_id,
    participantes_id,
    participantes_internos_id,
    participantes_friend_family_id,
    tipo_participante,
    fecha_sesion,
    estado_agendamiento
FROM reclutamientos 
ORDER BY updated_at DESC;

-- 7. VERIFICAR TRIGGER FUNCIONA
-- Insertar un registro de prueba para verificar el trigger
INSERT INTO reclutamientos (
    investigacion_id,
    participantes_friend_family_id,
    tipo_participante,
    reclutador_id,
    creado_por,
    fecha_sesion,
    duracion_sesion,
    estado_agendamiento
) VALUES (
    '5a832297-4cca-4bad-abe6-3aad99b8b5f3', -- investigacion_id
    (SELECT id FROM participantes_friend_family ORDER BY created_at DESC LIMIT 1), -- participantes_friend_family_id
    'friend_family', -- tipo_participante
    '37b272a8-8baa-493c-8877-f14d031e22a1', -- reclutador_id
    '37b272a8-8baa-493c-8877-f14d031e22a1', -- creado_por
    '2025-08-02T10:00:00.000Z', -- fecha_sesion
    60, -- duracion_sesion
    '0b8723e0-4f43-455d-bd95-a9576b7beb9d' -- estado_agendamiento
);

-- 8. VERIFICAR QUE SE CREÓ EL HISTORIAL
SELECT 
    'HISTORIAL DESPUÉS DE INSERCIÓN' as fuente,
    id,
    participante_friend_family_id,
    reclutamiento_id,
    investigacion_id,
    estado_sesion,
    created_at
FROM historial_participacion_participantes_friend_family 
ORDER BY created_at DESC; 