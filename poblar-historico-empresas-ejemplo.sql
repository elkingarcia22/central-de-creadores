-- ====================================
-- POBLAR HISTORIAL DE EMPRESAS CON DATOS DE EJEMPLO
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
    'investigaciones' as tabla,
    COUNT(*) as total
FROM investigaciones
UNION ALL
SELECT 
    'participantes' as tabla,
    COUNT(*) as total
FROM participantes
UNION ALL
SELECT 
    'reclutamientos' as tabla,
    COUNT(*) as total
FROM reclutamientos;

-- Insertar datos de ejemplo en el historial
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
    -- Empresa (usar la primera empresa disponible)
    (SELECT id FROM empresas LIMIT 1),
    
    -- Investigación (usar la primera investigación disponible)
    (SELECT id FROM investigaciones LIMIT 1),
    
    -- Participante (usar el primer participante con empresa)
    (SELECT p.id FROM participantes p WHERE p.empresa_id IS NOT NULL LIMIT 1),
    
    -- Reclutamiento (usar el primer reclutamiento disponible)
    (SELECT id FROM reclutamientos LIMIT 1),
    
    -- Fecha de participación (hace 30 días)
    NOW() - INTERVAL '30 days',
    
    -- Duración de sesión
    60,
    
    -- Estado de sesión
    'completada',
    
    -- Rol del participante
    'Product Manager',
    
    -- Departamento del participante
    'Producto',
    
    -- Tipo de investigación
    'Usabilidad',
    
    -- Producto evaluado
    'App Móvil',
    
    -- Satisfacción del participante (1-5)
    4,
    
    -- Calidad del feedback
    'Excelente feedback sobre la navegación y flujo de usuario. El participante identificó varios puntos de fricción importantes.',
    
    -- Insights obtenidos
    'Se identificaron 3 puntos críticos de mejora en el flujo de onboarding. El participante sugiere simplificar el proceso de registro.',
    
    -- Seguimiento requerido
    true,
    
    -- Fecha de seguimiento
    NOW() + INTERVAL '7 days',
    
    -- Notas de seguimiento
    'Programar sesión de seguimiento para validar las mejoras implementadas.',
    
    -- Creado por (usar el primer usuario disponible)
    (SELECT id FROM usuarios LIMIT 1)

WHERE NOT EXISTS (
    SELECT 1 FROM historial_participacion_empresas 
    WHERE empresa_id = (SELECT id FROM empresas LIMIT 1)
    AND fecha_participacion = NOW() - INTERVAL '30 days'
);

-- Insertar segundo registro de ejemplo
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
    creado_por
)
SELECT 
    -- Empresa (usar la primera empresa disponible)
    (SELECT id FROM empresas LIMIT 1),
    
    -- Investigación (usar la primera investigación disponible)
    (SELECT id FROM investigaciones LIMIT 1),
    
    -- Participante (usar el primer participante con empresa)
    (SELECT p.id FROM participantes p WHERE p.empresa_id IS NOT NULL LIMIT 1),
    
    -- Reclutamiento (usar el primer reclutamiento disponible)
    (SELECT id FROM reclutamientos LIMIT 1),
    
    -- Fecha de participación (hace 15 días)
    NOW() - INTERVAL '15 days',
    
    -- Duración de sesión
    90,
    
    -- Estado de sesión
    'completada',
    
    -- Rol del participante
    'UX Designer',
    
    -- Departamento del participante
    'Diseño',
    
    -- Tipo de investigación
    'Entrevista',
    
    -- Producto evaluado
    'Dashboard Web',
    
    -- Satisfacción del participante (1-5)
    5,
    
    -- Calidad del feedback
    'Feedback muy detallado sobre la experiencia de usuario. El participante proporcionó insights valiosos sobre la usabilidad.',
    
    -- Insights obtenidos
    'Se identificaron oportunidades de mejora en la visualización de datos. El participante sugiere implementar filtros más intuitivos.',
    
    -- Seguimiento requerido
    false,
    
    -- Creado por (usar el primer usuario disponible)
    (SELECT id FROM usuarios LIMIT 1)

WHERE NOT EXISTS (
    SELECT 1 FROM historial_participacion_empresas 
    WHERE empresa_id = (SELECT id FROM empresas LIMIT 1)
    AND fecha_participacion = NOW() - INTERVAL '15 days'
);

-- Insertar tercer registro de ejemplo
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
    creado_por
)
SELECT 
    -- Empresa (usar la primera empresa disponible)
    (SELECT id FROM empresas LIMIT 1),
    
    -- Investigación (usar la primera investigación disponible)
    (SELECT id FROM investigaciones LIMIT 1),
    
    -- Participante (usar el primer participante con empresa)
    (SELECT p.id FROM participantes p WHERE p.empresa_id IS NOT NULL LIMIT 1),
    
    -- Reclutamiento (usar el primer reclutamiento disponible)
    (SELECT id FROM reclutamientos LIMIT 1),
    
    -- Fecha de participación (hace 7 días)
    NOW() - INTERVAL '7 days',
    
    -- Duración de sesión
    45,
    
    -- Estado de sesión
    'completada',
    
    -- Rol del participante
    'Business Analyst',
    
    -- Departamento del participante
    'Análisis',
    
    -- Tipo de investigación
    'Focus Group',
    
    -- Producto evaluado
    'API Platform',
    
    -- Satisfacción del participante (1-5)
    3,
    
    -- Calidad del feedback
    'Feedback moderado. El participante encontró algunos aspectos confusos pero proporcionó sugerencias útiles.',
    
    -- Insights obtenidos
    'Se identificaron necesidades de documentación más clara. El participante sugiere mejorar la guía de integración.',
    
    -- Seguimiento requerido
    true,
    
    -- Creado por (usar el primer usuario disponible)
    (SELECT id FROM usuarios LIMIT 1)

WHERE NOT EXISTS (
    SELECT 1 FROM historial_participacion_empresas 
    WHERE empresa_id = (SELECT id FROM empresas LIMIT 1)
    AND fecha_participacion = NOW() - INTERVAL '7 days'
);

-- Verificar datos insertados
SELECT '=== VERIFICAR DATOS INSERTADOS ===' as info;

SELECT 
    COUNT(*) as total_registros
FROM historial_participacion_empresas;

-- Mostrar los registros insertados
SELECT 
    h.id,
    e.nombre as empresa,
    i.nombre as investigacion,
    p.nombre as participante,
    h.fecha_participacion,
    h.duracion_sesion,
    h.estado_sesion,
    h.rol_participante,
    h.departamento_participante,
    h.tipo_investigacion,
    h.producto_evaluado,
    h.satisfaccion_participante,
    h.seguimiento_requerido
FROM historial_participacion_empresas h
LEFT JOIN empresas e ON h.empresa_id = e.id
LEFT JOIN investigaciones i ON h.investigacion_id = i.id
LEFT JOIN participantes p ON h.participante_id = p.id
ORDER BY h.fecha_participacion DESC;

-- Mensaje de confirmación
SELECT '✅ Historial de empresas poblado exitosamente con datos de ejemplo' as resultado; 