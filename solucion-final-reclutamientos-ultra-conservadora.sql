-- ====================================
-- SOLUCIÓN FINAL RECLUTAMIENTOS - VISTA ULTRA CONSERVADORA
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- 1. Corregir la FK de creado_por en reclutamientos
ALTER TABLE reclutamientos 
DROP CONSTRAINT IF EXISTS reclutamientos_creado_por_fkey;

ALTER TABLE reclutamientos 
ADD CONSTRAINT reclutamientos_creado_por_fkey 
FOREIGN KEY (creado_por) REFERENCES usuarios(id);

-- 2. Crear vista ultra-conservadora usando solo columnas básicas
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
    
    -- Datos de investigación (solo nombre básico)
    i.nombre as investigacion_nombre,
    i.estado as investigacion_estado,
    
    -- Datos de participante (solo nombre básico)
    p.nombre as participante_nombre,
    
    -- Datos de reclutador (solo nombre básico)
    ur.nombre as reclutador_nombre,
    ur.correo as reclutador_correo,
    
    -- Datos de estado agendamiento (solo nombre básico)
    eac.nombre as estado_agendamiento_nombre
    
FROM reclutamientos r
LEFT JOIN investigaciones i ON r.investigacion_id = i.id
LEFT JOIN participantes p ON r.participantes_id = p.id
LEFT JOIN usuarios ur ON r.reclutador_id = ur.id
LEFT JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id;

-- 3. Verificar que la vista se creó correctamente
SELECT 'Vista creada exitosamente' as resultado;
SELECT COUNT(*) as total_reclutamientos FROM vista_reclutamientos_completa; 