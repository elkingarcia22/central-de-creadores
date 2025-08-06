-- ====================================
-- DIAGNOSTICAR Y CORREGIR LIBRETOS
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar investigaciones por agendar
SELECT 
    '=== INVESTIGACIONES POR AGENDAR ===' as info;

SELECT 
    id,
    nombre,
    estado,
    libreto,
    creado_el
FROM investigaciones 
WHERE estado = 'por_agendar'
ORDER BY creado_el DESC;

-- 2. Verificar libretos existentes
SELECT 
    '=== LIBRETOS EXISTENTES ===' as info;

SELECT 
    id,
    investigacion_id,
    nombre_sesion,
    numero_participantes,
    creado_el
FROM libretos_investigacion 
ORDER BY creado_el DESC;

-- 3. Verificar relación entre investigaciones y libretos
SELECT 
    '=== RELACIÓN INVESTIGACIONES-LIBRETOS ===' as info;

SELECT 
    i.id as investigacion_id,
    i.nombre as investigacion_nombre,
    i.libreto as libreto_id_investigacion,
    li.id as libreto_id_directo,
    li.nombre_sesion as libreto_nombre,
    li.numero_participantes as libreto_participantes
FROM investigaciones i
LEFT JOIN libretos_investigacion li ON i.libreto::uuid = li.id
WHERE i.estado = 'por_agendar'
ORDER BY i.creado_el DESC;

-- 4. Crear libretos para investigaciones que no los tienen
-- Primero, verificar cuáles investigaciones necesitan libretos
SELECT 
    '=== INVESTIGACIONES SIN LIBRETOS ===' as info;

SELECT 
    i.id,
    i.nombre,
    i.libreto
FROM investigaciones i
WHERE i.estado = 'por_agendar' 
  AND (i.libreto IS NULL OR i.libreto = '' OR i.libreto = 'null')
ORDER BY i.creado_el DESC;

-- 5. Crear libretos para las investigaciones que no los tienen
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
    'Libreto para ' || i.nombre as nombre_sesion,
    8 as numero_participantes, -- Valor por defecto basado en la imagen
    'Descripción del libreto para la investigación: ' || i.nombre as descripcion_general,
    NOW() as creado_el,
    NOW() as actualizado_el
FROM investigaciones i
WHERE i.estado = 'por_agendar' 
  AND (i.libreto IS NULL OR i.libreto = '' OR i.libreto = 'null')
  AND NOT EXISTS (
      SELECT 1 FROM libretos_investigacion li 
      WHERE li.investigacion_id = i.id
  );

-- 6. Actualizar el campo libreto en investigaciones
UPDATE investigaciones 
SET libreto = li.id::text
FROM libretos_investigacion li
WHERE investigaciones.id = li.investigacion_id
  AND investigaciones.estado = 'por_agendar'
  AND (investigaciones.libreto IS NULL OR investigaciones.libreto = '' OR investigaciones.libreto = 'null');

-- 7. Verificar el resultado
SELECT 
    '=== RESULTADO FINAL ===' as info;

SELECT 
    i.id as investigacion_id,
    i.nombre as investigacion_nombre,
    i.libreto as libreto_id_investigacion,
    li.id as libreto_id_directo,
    li.nombre_sesion as libreto_nombre,
    li.numero_participantes as libreto_participantes
FROM investigaciones i
LEFT JOIN libretos_investigacion li ON i.libreto::uuid = li.id
WHERE i.estado = 'por_agendar'
ORDER BY i.creado_el DESC;

-- 8. Probar la vista actualizada
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