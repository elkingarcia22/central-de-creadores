-- =====================================================
-- SCRIPT COMPLETO PARA MÓDULO DE RECLUTAMIENTO
-- =====================================================

-- Paso 1: Verificar estructura actual
\echo '🔍 Verificando estructura actual...'

-- Verificar si existe la vista actual
SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views 
WHERE viewname = 'vista_reclutamientos_completa';

-- Paso 2: Actualizar estados de reclutamiento existentes
\echo '📝 Actualizando estados de reclutamiento...'

-- Agregar columnas faltantes a estado_reclutamiento_cat
ALTER TABLE estado_reclutamiento_cat 
ADD COLUMN IF NOT EXISTS descripcion TEXT,
ADD COLUMN IF NOT EXISTS color VARCHAR(7),
ADD COLUMN IF NOT EXISTS orden INTEGER,
ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Actualizar estados existentes con valores apropiados
UPDATE estado_reclutamiento_cat 
SET 
    descripcion = CASE 
        WHEN nombre = 'Agendada' THEN 'Investigación con fecha y hora programada'
        WHEN nombre = 'En progreso' THEN 'Reclutamiento activo en curso'
        WHEN nombre = 'Por iniciar' THEN 'Investigación pendiente de iniciar reclutamiento'
        ELSE 'Estado no definido'
    END,
    color = CASE 
        WHEN nombre = 'Agendada' THEN '#10B981'
        WHEN nombre = 'En progreso' THEN '#3B82F6'
        WHEN nombre = 'Por iniciar' THEN '#F59E0B'
        ELSE '#6B7280'
    END,
    orden = CASE 
        WHEN nombre = 'Por iniciar' THEN 1
        WHEN nombre = 'En progreso' THEN 2
        WHEN nombre = 'Agendada' THEN 3
        ELSE 4
    END,
    activo = true,
    creado_en = NOW()
WHERE descripcion IS NULL OR color IS NULL OR orden IS NULL;

-- Paso 3: Eliminar vista anterior si existe
\echo '🗑️ Eliminando vista anterior...'
DROP VIEW IF EXISTS vista_reclutamientos_completa;

-- Paso 4: Crear vista final corregida
\echo '📊 Creando vista final...'
CREATE VIEW vista_reclutamientos_completa AS
SELECT 
    r.id as reclutamiento_id,
    r.investigacion_id,
    r.libreto_id,
    r.estado_reclutamiento_id,
    r.creado_en,
    r.actualizado_en,
    
    -- Datos de la investigación
    i.titulo as titulo_investigacion,
    i.descripcion as descripcion_investigacion,
    i.estado as estado_investigacion,
    
    -- Datos del libreto
    l.titulo as titulo_libreto,
    l.numero_participantes as participantes_requeridos,
    
    -- Estado del reclutamiento
    er.nombre as estado_reclutamiento,
    er.color as color_estado,
    er.orden as orden_estado,
    
    -- Responsable (usuario que creó la investigación)
    u.nombre as responsable_nombre,
    u.apellido as responsable_apellido,
    u.email as responsable_email,
    
    -- Implementador (usuario asignado al libreto)
    impl.nombre as implementador_nombre,
    impl.apellido as implementador_apellido,
    impl.email as implementador_email,
    
    -- Contar participantes actuales del libreto
    COALESCE(COUNT(p.id), 0) as participantes_actuales,
    
    -- Calcular progreso
    CASE 
        WHEN l.numero_participantes > 0 THEN 
            ROUND((COUNT(p.id)::decimal / l.numero_participantes::decimal) * 100, 1)
        ELSE 0 
    END as progreso_porcentaje,
    
    -- Determinar si está completo
    CASE 
        WHEN COUNT(p.id) >= l.numero_participantes THEN true
        ELSE false 
    END as reclutamiento_completo

FROM reclutamientos r
LEFT JOIN investigaciones i ON r.investigacion_id = i.id
LEFT JOIN libretos l ON r.libreto_id = l.id
LEFT JOIN estado_reclutamiento_cat er ON r.estado_reclutamiento_id = er.id
LEFT JOIN usuarios u ON i.usuario_id = u.id
LEFT JOIN usuarios impl ON l.usuario_id = impl.id
LEFT JOIN participantes p ON l.id = p.libreto_id

GROUP BY 
    r.id, r.investigacion_id, r.libreto_id, r.estado_reclutamiento_id, 
    r.creado_en, r.actualizado_en,
    i.titulo, i.descripcion, i.estado,
    l.titulo, l.numero_participantes,
    er.nombre, er.color, er.orden,
    u.nombre, u.apellido, u.email,
    impl.nombre, impl.apellido, impl.email

ORDER BY r.creado_en DESC;

-- Paso 5: Verificar la vista creada
\echo '✅ Verificando vista creada...'
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'vista_reclutamientos_completa'
ORDER BY ordinal_position;

-- Paso 6: Probar consulta básica
\echo '🧪 Probando consulta básica...'
SELECT 
    reclutamiento_id,
    titulo_investigacion,
    titulo_libreto,
    estado_reclutamiento,
    participantes_requeridos,
    participantes_actuales,
    progreso_porcentaje
FROM vista_reclutamientos_completa
LIMIT 5;

\echo '🎉 ¡Módulo de reclutamiento configurado exitosamente!' 