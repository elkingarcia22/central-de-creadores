-- ====================================
-- SOLUCIÓN COMPLETA PARA RECLUTAMIENTOS
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar la situación actual
SELECT 
    '=== SITUACIÓN ACTUAL ===' as info;

-- Verificar FKs de reclutamientos
SELECT 
    'FKs de reclutamientos:' as info,
    tc.constraint_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'reclutamientos'
ORDER BY kcu.column_name;

-- 2. Verificar si existe la FK problemática de creado_por
SELECT 
    'FK de creado_por:' as info,
    tc.constraint_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'reclutamientos'
  AND kcu.column_name = 'creado_por';

-- 3. Eliminar la FK problemática de creado_por (si existe)
DO $$
BEGIN
    -- Intentar eliminar la FK si existe
    BEGIN
        ALTER TABLE reclutamientos DROP CONSTRAINT reclutamientos_creado_por_fkey;
        RAISE NOTICE 'FK reclutamientos_creado_por_fkey eliminada';
    EXCEPTION
        WHEN undefined_object THEN
            RAISE NOTICE 'La FK reclutamientos_creado_por_fkey no existe';
    END;
END $$;

-- 4. Crear nueva FK que apunte a usuarios (igual que reclutador_id)
ALTER TABLE reclutamientos 
ADD CONSTRAINT reclutamientos_creado_por_fkey 
FOREIGN KEY (creado_por) REFERENCES usuarios(id);

-- 5. Verificar que la FK se creó correctamente
SELECT 
    'FK corregida de creado_por:' as info,
    tc.constraint_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'reclutamientos'
  AND kcu.column_name = 'creado_por';

-- 6. Crear la vista de reclutamientos completa
DROP VIEW IF EXISTS vista_reclutamientos_completa;

CREATE VIEW vista_reclutamientos_completa AS
SELECT 
    r.id,
    r.investigacion_id,
    r.participantes_id,
    r.fecha_asignado,
    r.fecha_sesion,
    r.reclutador_id,
    r.creado_por,
    r.estado_agendamiento,
    
    -- Datos de la investigación
    i.nombre as investigacion_nombre,
    i.descripcion as investigacion_descripcion,
    i.estado as investigacion_estado,
    i.fecha_inicio as investigacion_fecha_inicio,
    i.fecha_fin as investigacion_fecha_fin,
    
    -- Datos del participante
    p.nombre as participante_nombre,
    p.apellido as participante_apellido,
    p.email as participante_email,
    p.telefono as participante_telefono,
    p.edad as participante_edad,
    p.genero as participante_genero,
    
    -- Datos del reclutador (desde usuarios_con_roles)
    ur.full_name as reclutador_nombre,
    ur.email as reclutador_email,
    ur.avatar_url as reclutador_avatar,
    ur.roles as reclutador_roles,
    
    -- Datos del creador (desde usuarios_con_roles)
    uc.full_name as creador_nombre,
    uc.email as creador_email,
    uc.avatar_url as creador_avatar,
    uc.roles as creador_roles,
    
    -- Datos del estado de agendamiento
    eac.nombre as estado_agendamiento_nombre,
    eac.descripcion as estado_agendamiento_descripcion,
    eac.color as estado_agendamiento_color,
    
    -- Verificar si la investigación tiene libreto
    CASE 
        WHEN li.id IS NOT NULL THEN true
        ELSE false
    END as tiene_libreto,
    
    -- Fechas formateadas
    r.fecha_asignado::date as fecha_asignado_date,
    r.fecha_sesion::date as fecha_sesion_date,
    
    -- Timestamps (usando fecha_asignado como referencia)
    r.fecha_asignado as created_at,
    r.fecha_asignado as updated_at
    
FROM reclutamientos r
LEFT JOIN investigaciones i ON r.investigacion_id = i.id
LEFT JOIN participantes p ON r.participantes_id = p.id
LEFT JOIN usuarios_con_roles ur ON r.reclutador_id = ur.id
LEFT JOIN usuarios_con_roles uc ON r.creado_por = uc.id
LEFT JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
LEFT JOIN libretos_investigacion li ON i.id = li.investigacion_id;

-- 7. Verificar que la vista se creó correctamente
SELECT 
    '✅ Vista vista_reclutamientos_completa creada exitosamente' as status;

-- 8. Probar la vista
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

-- 9. Verificar usuarios disponibles
SELECT 
    'Usuarios disponibles para reclutamientos:' as info,
    id,
    full_name,
    email,
    created_at
FROM usuarios_con_roles 
ORDER BY full_name
LIMIT 5;

-- 10. Mensaje final
SELECT 
    '✅ SOLUCIÓN COMPLETA APLICADA' as status,
    'Reclutamientos ahora debería funcionar correctamente' as descripcion; 