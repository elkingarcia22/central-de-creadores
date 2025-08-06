-- Script para actualizar la hora de sesión del participante friend & family
-- Basado en los logs, el reclutamiento ID es: daa4323f-413c-4167-908d-25c26a7822cb

-- Primero, verificar el estado actual
SELECT 
    id,
    participantes_friend_family_id,
    fecha_sesion,
    hora_sesion,
    duracion_sesion
FROM reclutamientos 
WHERE id = 'daa4323f-413c-4167-908d-25c26a7822cb';

-- Actualizar la hora de sesión (ejemplo: 14:30:00)
UPDATE reclutamientos 
SET hora_sesion = '14:30:00'
WHERE id = 'daa4323f-413c-4167-908d-25c26a7822cb';

-- Verificar el cambio
SELECT 
    id,
    participantes_friend_family_id,
    fecha_sesion,
    hora_sesion,
    duracion_sesion
FROM reclutamientos 
WHERE id = 'daa4323f-413c-4167-908d-25c26a7822cb'; 