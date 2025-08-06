-- ====================================
-- SOLUCIÓN FINAL RECLUTAMIENTOS - VISTA MÍNIMA
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- 1. Corregir la FK de creado_por en reclutamientos
ALTER TABLE reclutamientos 
DROP CONSTRAINT IF EXISTS reclutamientos_creado_por_fkey;

ALTER TABLE reclutamientos 
ADD CONSTRAINT reclutamientos_creado_por_fkey 
FOREIGN KEY (creado_por) REFERENCES usuarios(id);

-- 2. Crear vista mínima usando solo columnas básicas
DROP VIEW IF EXISTS vista_reclutamientos_completa;

CREATE VIEW vista_reclutamientos_completa AS
SELECT 
    r.id as reclutamiento_id,
    r.investigacion_id,
    r.participantes_id,
    r.reclutador_id,
    r.estado_agendamiento,
    r.creado_por,
    
    -- Datos de investigación
    i.titulo as investigacion_titulo,
    i.estado as investigacion_estado,
    
    -- Datos de participante (estructura real)
    p.nombre as participante_nombre,
    p.doleres_necesidades as participante_dolores,
    p.descripción as participante_descripcion,
    
    -- Datos de reclutador
    ur.nombre as reclutador_nombre,
    ur.apellidos as reclutador_apellidos,
    ur.email as reclutador_email,
    
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