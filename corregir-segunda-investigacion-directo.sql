-- ====================================
-- CORREGIR SEGUNDA INVESTIGACIÓN - VERSIÓN DIRECTA
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar el ID exacto de la segunda investigación
SELECT 
    '=== ID DE LA SEGUNDA INVESTIGACIÓN ===' as info;

SELECT 
    id,
    nombre,
    estado,
    libreto
FROM investigaciones 
WHERE nombre = 'objetivos - Copia - Copia'
  AND estado = 'por_agendar';

-- 2. Crear libreto directamente para esta investigación
INSERT INTO libretos_investigacion (
    investigacion_id,
    nombre_sesion,
    numero_participantes,
    descripcion_general,
    creado_el,
    actualizado_el
)
SELECT 
    i.id as investigacion_id,
    'Libreto para objetivos - Copia - Copia' as nombre_sesion,
    8 as numero_participantes,
    'Descripción del libreto para la investigación: objetivos - Copia - Copia' as descripcion_general,
    NOW() as creado_el,
    NOW() as actualizado_el
FROM investigaciones i
WHERE i.nombre = 'objetivos - Copia - Copia'
  AND i.estado = 'por_agendar'
  AND NOT EXISTS (
      SELECT 1 FROM libretos_investigacion li 
      WHERE li.investigacion_id = i.id
  );

-- 3. Actualizar el campo libreto en la investigación
UPDATE investigaciones 
SET libreto = li.id::text
FROM libretos_investigacion li
WHERE investigaciones.nombre = 'objetivos - Copia - Copia'
  AND investigaciones.estado = 'por_agendar'
  AND li.investigacion_id = investigaciones.id;

-- 4. Verificar que se creó el libreto
SELECT 
    '=== LIBRETO CREADO ===' as info;

SELECT 
    id,
    investigacion_id,
    nombre_sesion,
    numero_participantes,
    creado_el
FROM libretos_investigacion 
WHERE nombre_sesion = 'Libreto para objetivos - Copia - Copia';

-- 5. Verificar la relación actualizada
SELECT 
    '=== RELACIÓN ACTUALIZADA ===' as info;

SELECT 
    i.id,
    i.nombre,
    i.libreto,
    li.id as libreto_id,
    li.nombre_sesion,
    li.numero_participantes
FROM investigaciones i
LEFT JOIN libretos_investigacion li ON i.libreto::uuid = li.id
WHERE i.estado = 'por_agendar'
ORDER BY i.creado_el DESC;

-- 6. Probar la vista actualizada
SELECT 
    '=== VISTA ACTUALIZADA ===' as info;

SELECT 
    investigacion_nombre,
    libreto_titulo,
    libreto_numero_participantes,
    participantes_reclutados,
    progreso_reclutamiento,
    porcentaje_completitud
FROM vista_reclutamientos_completa 
ORDER BY creado_en DESC; 