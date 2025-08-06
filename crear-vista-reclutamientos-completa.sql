-- ====================================
-- CREAR VISTA RECLUTAMIENTOS COMPLETA
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- 1. Eliminar la vista si existe
DROP VIEW IF EXISTS vista_reclutamientos_completa;

-- 2. Crear la vista completa con todos los datos relacionados
-- Crear vista completa para reclutamientos
-- Esta vista combina investigaciones con sus libretos, usuarios y métricas de reclutamiento

CREATE OR REPLACE VIEW vista_reclutamientos_completa AS
SELECT 
  i.id as reclutamiento_id,
  i.id as investigacion_id,
  i.libreto as libreto_id,
  i.created_at as creado_en,
  i.updated_at as actualizado_en,
  i.nombre as investigacion_nombre,
  i.estado as estado_investigacion,
  i.fecha_inicio as investigacion_fecha_inicio,
  i.fecha_fin as investigacion_fecha_fin,
  i.riesgo_automatico as investigacion_riesgo,
  li.titulo as libreto_titulo,
  li.descripcion as libreto_descripcion,
  COALESCE(li.numero_participantes, 0) as libreto_numero_participantes,
  p.nombre as producto_nombre,
  ti.nombre as tipo_investigacion_nombre,
  COALESCE(s.participantes_reclutados, 0) as participantes_reclutados,
  resp.nombre as responsable_nombre,
  resp.email as responsable_correo,
  impl.nombre as implementador_nombre,
  impl.email as implementador_correo,
  CASE 
    WHEN i.estado = 'en_borrador' THEN 'Pendiente'
    WHEN i.estado = 'en_progreso' THEN 'En Progreso'
    WHEN i.estado = 'pausado' THEN 'Pausado'
    WHEN i.estado = 'deprecado' THEN 'Cancelado'
    ELSE 'Pendiente'
  END as estado_reclutamiento_nombre,
  CASE 
    WHEN i.estado = 'en_borrador' THEN '#6B7280'
    WHEN i.estado = 'en_progreso' THEN '#3B82F6'
    WHEN i.estado = 'pausado' THEN '#F59E0B'
    WHEN i.estado = 'deprecado' THEN '#EF4444'
    ELSE '#6B7280'
  END as estado_reclutamiento_color,
  CASE 
    WHEN i.estado = 'en_borrador' THEN 1
    WHEN i.estado = 'en_progreso' THEN 2
    WHEN i.estado = 'pausado' THEN 3
    WHEN i.estado = 'deprecado' THEN 4
    ELSE 1
  END as orden_estado,
  CASE 
    WHEN COALESCE(li.numero_participantes, 0) > 0 
    THEN ROUND((COALESCE(s.participantes_reclutados, 0) * 100.0) / li.numero_participantes)
    ELSE 0
  END as porcentaje_completitud,
  CONCAT(COALESCE(s.participantes_reclutados, 0), '/', COALESCE(li.numero_participantes, 0)) as progreso_reclutamiento,
  CASE 
    WHEN COALESCE(s.participantes_reclutados, 0) >= COALESCE(li.numero_participantes, 0) 
    AND COALESCE(li.numero_participantes, 0) > 0
    THEN true
    ELSE false
  END as reclutamiento_completo
FROM investigaciones i
LEFT JOIN libretos_investigacion li ON i.libreto = li.id
LEFT JOIN productos p ON i.producto_id = p.id
LEFT JOIN tipos_investigacion ti ON i.tipo_investigacion_id = ti.id
LEFT JOIN seguimientos_investigacion s ON i.id = s.investigacion_id
LEFT JOIN auth.users resp ON i.responsable_id = resp.id
LEFT JOIN auth.users impl ON i.implementador_id = impl.id
WHERE i.estado IN ('en_borrador', 'en_progreso', 'pausado', 'deprecado')
ORDER BY i.created_at DESC;

-- 3. Verificar que la vista se creó correctamente
SELECT 
    '✅ Vista vista_reclutamientos_completa creada exitosamente' as status;

-- 4. Probar la vista
SELECT 
    id,
    investigacion_nombre,
    participante_nombre,
    participante_apellido,
    estado_agendamiento_nombre,
    fecha_asignado_date
FROM vista_reclutamientos_completa 
ORDER BY fecha_asignado DESC
LIMIT 5;

-- 5. Verificar estructura de la vista
SELECT 
    'Estructura de la vista:' as info,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'vista_reclutamientos_completa' 
ORDER BY ordinal_position; 