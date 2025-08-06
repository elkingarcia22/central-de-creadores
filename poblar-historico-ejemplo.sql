-- ====================================
-- POBLAR HISTORIAL DE PARTICIPACIÓN CON DATOS DE EJEMPLO
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- Verificar que existen datos necesarios
SELECT '=== VERIFICAR DATOS NECESARIOS ===' as info;

SELECT 
    'empresas' as tabla,
    COUNT(*) as total
FROM empresas
UNION ALL
SELECT 
    'participantes' as tabla,
    COUNT(*) as total
FROM participantes
UNION ALL
SELECT 
    'investigaciones' as tabla,
    COUNT(*) as total
FROM investigaciones
UNION ALL
SELECT 
    'reclutamientos' as tabla,
    COUNT(*) as total
FROM reclutamientos;

-- Insertar datos de ejemplo en historial de empresas
INSERT INTO historial_participacion_empresas (
    empresa_id,
    investigacion_id,
    participante_id,
    reclutamiento_id,
    fecha_participacion,
    duracion_sesion,
    estado_sesion,
    rol_participante,
    departamento_participante,
    tipo_investigacion,
    producto_evaluado,
    satisfaccion_participante,
    calidad_feedback,
    insights_obtenidos,
    seguimiento_requerido,
    fecha_seguimiento,
    notas_seguimiento,
    creado_por
) 
SELECT 
    e.id as empresa_id,
    i.id as investigacion_id,
    p.id as participante_id,
    r.id as reclutamiento_id,
    NOW() - INTERVAL '1 day' * (random() * 30)::int as fecha_participacion,
    60 as duracion_sesion,
    CASE 
      WHEN random() > 0.2 THEN 'completada'
      WHEN random() > 0.5 THEN 'cancelada'
      ELSE 'reprogramada'
    END as estado_sesion,
    'Usuario final' as rol_participante,
    'TI' as departamento_participante,
    'Usabilidad' as tipo_investigacion,
    'Aplicación móvil' as producto_evaluado,
    (random() * 5 + 1)::int as satisfaccion_participante,
    'Excelente experiencia de usuario, interfaz intuitiva' as calidad_feedback,
    'Los usuarios valoran la simplicidad de navegación' as insights_obtenidos,
    false as seguimiento_requerido,
    NULL as fecha_seguimiento,
    NULL as notas_seguimiento,
    (SELECT id FROM auth.users LIMIT 1) as creado_por
FROM empresas e
CROSS JOIN LATERAL (
    SELECT id FROM investigaciones ORDER BY random() LIMIT 1
) i
CROSS JOIN LATERAL (
    SELECT id FROM participantes WHERE tipo = 'externo' ORDER BY random() LIMIT 1
) p
CROSS JOIN LATERAL (
    SELECT id FROM reclutamientos ORDER BY random() LIMIT 1
) r
WHERE e.id IS NOT NULL
LIMIT 10;

-- Insertar datos de ejemplo en historial de participantes
INSERT INTO historial_participacion_participantes (
    participante_id,
    investigacion_id,
    reclutamiento_id,
    empresa_id,
    fecha_participacion,
    duracion_sesion,
    estado_sesion,
    rol_participante,
    departamento_participante,
    tipo_investigacion,
    producto_evaluado,
    satisfaccion_participante,
    calidad_feedback,
    insights_obtenidos,
    seguimiento_requerido,
    fecha_seguimiento,
    notas_seguimiento,
    creado_por
) 
SELECT 
    p.id as participante_id,
    i.id as investigacion_id,
    r.id as reclutamiento_id,
    CASE WHEN p.tipo = 'externo' THEN p.empresa_id ELSE NULL END as empresa_id,
    NOW() - INTERVAL '1 day' * (random() * 30)::int as fecha_participacion,
    60 as duracion_sesion,
    CASE 
      WHEN random() > 0.2 THEN 'completada'
      WHEN random() > 0.5 THEN 'cancelada'
      ELSE 'reprogramada'
    END as estado_sesion,
    'Usuario final' as rol_participante,
    'TI' as departamento_participante,
    'Usabilidad' as tipo_investigacion,
    'Aplicación móvil' as producto_evaluado,
    (random() * 5 + 1)::int as satisfaccion_participante,
    'Excelente experiencia de usuario, interfaz intuitiva' as calidad_feedback,
    'Los usuarios valoran la simplicidad de navegación' as insights_obtenidos,
    false as seguimiento_requerido,
    NULL as fecha_seguimiento,
    NULL as notas_seguimiento,
    (SELECT id FROM auth.users LIMIT 1) as creado_por
FROM participantes p
CROSS JOIN LATERAL (
    SELECT id FROM investigaciones ORDER BY random() LIMIT 1
) i
CROSS JOIN LATERAL (
    SELECT id FROM reclutamientos ORDER BY random() LIMIT 1
) r
WHERE p.id IS NOT NULL
LIMIT 15;

-- Verificar datos insertados
SELECT '=== VERIFICAR DATOS INSERTADOS ===' as info;

SELECT 
    'historial_empresas' as tabla,
    COUNT(*) as total_registros
FROM historial_participacion_empresas
UNION ALL
SELECT 
    'historial_participantes' as tabla,
    COUNT(*) as total_registros
FROM historial_participacion_participantes;

-- Mostrar estadísticas por estado
SELECT '=== ESTADÍSTICAS POR ESTADO ===' as info;

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

-- Mostrar algunos ejemplos
SELECT '=== EJEMPLOS DE HISTORIAL EMPRESAS ===' as info;

SELECT 
    h.id,
    e.nombre as empresa,
    i.nombre as investigacion,
    h.fecha_participacion,
    h.estado_sesion,
    h.satisfaccion_participante
FROM historial_participacion_empresas h
JOIN empresas e ON h.empresa_id = e.id
JOIN investigaciones i ON h.investigacion_id = i.id
LIMIT 5;

SELECT '=== EJEMPLOS DE HISTORIAL PARTICIPANTES ===' as info;

SELECT 
    h.id,
    p.nombre as participante,
    p.tipo,
    i.nombre as investigacion,
    h.fecha_participacion,
    h.estado_sesion,
    h.satisfaccion_participante
FROM historial_participacion_participantes h
JOIN participantes p ON h.participante_id = p.id
JOIN investigaciones i ON h.investigacion_id = i.id
LIMIT 5; 