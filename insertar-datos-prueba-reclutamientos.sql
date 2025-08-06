-- ====================================
-- INSERTAR DATOS DE PRUEBA EN RECLUTAMIENTOS
-- ====================================

-- Primero, verificar que tenemos investigaciones con estado 'por_agendar'
SELECT '=== VERIFICANDO INVESTIGACIONES POR AGENDAR ===' as info;
SELECT 
    id,
    nombre,
    estado,
    fecha_inicio,
    fecha_fin
FROM investigaciones 
WHERE estado = 'por_agendar'
ORDER BY nombre;

-- Insertar datos de prueba en reclutamientos
-- Nota: Necesitamos IDs válidos de investigaciones, participantes y usuarios

-- Obtener una investigación con estado 'por_agendar' para usar como ejemplo
WITH investigacion_ejemplo AS (
    SELECT id 
    FROM investigaciones 
    WHERE estado = 'por_agendar' 
    LIMIT 1
),
usuario_ejemplo AS (
    SELECT id 
    FROM auth.users 
    LIMIT 1
)
INSERT INTO reclutamientos (
    investigacion_id,
    participantes_id,
    fecha_asignado,
    fecha_sesion,
    reclutador_id,
    creado_por,
    estado_agendamiento
)
SELECT 
    ie.id as investigacion_id,
    gen_random_uuid() as participantes_id, -- UUID simulado para participante
    NOW() as fecha_asignado,
    NOW() + INTERVAL '7 days' as fecha_sesion,
    ue.id as reclutador_id,
    ue.id as creado_por,
    gen_random_uuid() as estado_agendamiento -- UUID simulado para estado
FROM investigacion_ejemplo ie
CROSS JOIN usuario_ejemplo ue
WHERE ie.id IS NOT NULL AND ue.id IS NOT NULL;

-- Insertar más datos de prueba si hay múltiples investigaciones
WITH investigaciones_por_agendar AS (
    SELECT id 
    FROM investigaciones 
    WHERE estado = 'por_agendar'
),
usuario_ejemplo AS (
    SELECT id 
    FROM auth.users 
    LIMIT 1
)
INSERT INTO reclutamientos (
    investigacion_id,
    participantes_id,
    fecha_asignado,
    fecha_sesion,
    reclutador_id,
    creado_por,
    estado_agendamiento
)
SELECT 
    i.id as investigacion_id,
    gen_random_uuid() as participantes_id,
    NOW() - INTERVAL '3 days' as fecha_asignado,
    NOW() + INTERVAL '5 days' as fecha_sesion,
    u.id as reclutador_id,
    u.id as creado_por,
    gen_random_uuid() as estado_agendamiento
FROM investigaciones_por_agendar i
CROSS JOIN usuario_ejemplo u
WHERE i.id != (SELECT investigacion_id FROM reclutamientos LIMIT 1) -- Evitar duplicados
LIMIT 2;

-- Verificar los datos insertados
SELECT '=== DATOS INSERTADOS ===' as info;
SELECT 
    r.id,
    r.investigacion_id,
    r.participantes_id,
    r.fecha_asignado,
    r.fecha_sesion,
    r.reclutador_id,
    r.creado_por,
    r.estado_agendamiento,
    i.nombre as investigacion_nombre,
    i.estado as investigacion_estado
FROM reclutamientos r
LEFT JOIN investigaciones i ON r.investigacion_id = i.id
ORDER BY r.fecha_asignado DESC;

-- Verificar la vista
SELECT '=== VERIFICANDO VISTA ===' as info;
SELECT 
    id,
    investigacion_nombre,
    investigacion_estado,
    participante_nombre,
    participante_apellido,
    estado_agendamiento_nombre,
    fecha_asignado_date,
    tiene_libreto
FROM vista_reclutamientos_completa
ORDER BY fecha_asignado DESC; 