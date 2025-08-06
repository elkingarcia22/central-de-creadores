-- Verificar estados de agendamiento disponibles

-- 1. VER TABLA DE ESTADOS
SELECT 
    id,
    nombre,
    descripcion
FROM estado_agendamiento_cat
ORDER BY nombre;

-- 2. VER EJEMPLO DE RECLUTAMIENTOS EXISTENTES
SELECT 
    id,
    participantes_id,
    estado_agendamiento,
    fecha_sesion
FROM reclutamientos 
LIMIT 5;

-- 3. BUSCAR ESTADO "Finalizado"
SELECT 
    id,
    nombre,
    descripcion
FROM estado_agendamiento_cat
WHERE nombre ILIKE '%finalizado%'
OR nombre ILIKE '%completado%'
OR nombre ILIKE '%terminado%'; 