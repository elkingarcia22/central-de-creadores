-- ====================================
-- SOLUCIÓN FINAL RECLUTAMIENTOS - ESTRUCTURA REAL
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- 1. Corregir la FK de creado_por en reclutamientos
ALTER TABLE reclutamientos 
DROP CONSTRAINT IF EXISTS reclutamientos_creado_por_fkey;

ALTER TABLE reclutamientos 
ADD CONSTRAINT reclutamientos_creado_por_fkey 
FOREIGN KEY (creado_por) REFERENCES usuarios(id);

-- 2. Crear vista corregida usando la estructura real de todas las tablas
DROP VIEW IF EXISTS vista_reclutamientos_completa;

CREATE VIEW vista_reclutamientos_completa AS
SELECT 
    r.id as reclutamiento_id,
    r.investigacion_id,
    r.participantes_id,
    r.fecha_asignado,
    r.fecha_sesion,
    r.reclutador_id,
    r.creado_por,
    r.estado_agendamiento,
    
    -- Datos de investigación (estructura real)
    i.nombre as investigacion_nombre,
    i.estado as investigacion_estado,
    i.fecha_inicio as investigacion_fecha_inicio,
    i.fecha_fin as investigacion_fecha_fin,
    i.riesgo_automatico as investigacion_riesgo,
    
    -- Datos de participante (estructura real)
    p.nombre as participante_nombre,
    p.doleres_necesidades as participante_dolores,
    p.descripción as participante_descripcion,
    p.productos_relacionados as participante_productos,
    p.total_participaciones as participante_total_participaciones,
    p.fecha_ultima_participacion as participante_ultima_participacion,
    
    -- Datos de reclutador (estructura real)
    ur.nombre as reclutador_nombre,
    ur.correo as reclutador_correo,
    ur.activo as reclutador_activo,
    
    -- Datos de estado agendamiento
    eac.nombre as estado_agendamiento_nombre,
    eac.color as estado_agendamiento_color
    
FROM reclutamientos r
LEFT JOIN investigaciones i ON r.investigacion_id = i.id
LEFT JOIN participantes p ON r.participantes_id = p.id
LEFT JOIN usuarios ur ON r.reclutador_id = ur.id
LEFT JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id;

-- 3. Verificar que la vista se creó correctamente
SELECT 'Vista creada exitosamente' as resultado;
SELECT COUNT(*) as total_reclutamientos FROM vista_reclutamientos_completa;

-- 4. Mostrar estructura de la vista
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'vista_reclutamientos_completa' 
AND table_schema = 'public'
ORDER BY ordinal_position; 