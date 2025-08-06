-- ====================================
-- DIAGNÓSTICO DE INVESTIGACIONES REALES
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar todas las investigaciones existentes
SELECT 
    '=== TODAS LAS INVESTIGACIONES ===' as info;

SELECT 
    id,
    nombre,
    estado,
    libreto,
    responsable_id,
    implementador_id,
    estado_reclutamiento,
    creado_el,
    actualizado_el
FROM investigaciones 
ORDER BY creado_el DESC;

-- 2. Verificar investigaciones por estado
SELECT 
    '=== INVESTIGACIONES POR ESTADO ===' as info;

SELECT 
    estado,
    COUNT(*) as cantidad
FROM investigaciones 
GROUP BY estado
ORDER BY cantidad DESC;

-- 3. Verificar investigaciones con libreto
SELECT 
    '=== INVESTIGACIONES CON LIBRETO ===' as info;

SELECT 
    i.id,
    i.nombre,
    i.estado,
    i.libreto,
    li.nombre_sesion,
    li.numero_participantes,
    li.numero_participantes_esperados
FROM investigaciones i
LEFT JOIN libretos_investigacion li ON i.libreto::uuid = li.id
WHERE i.libreto IS NOT NULL
ORDER BY i.creado_el DESC;

-- 4. Verificar libretos existentes
SELECT 
    '=== LIBRETOS EXISTENTES ===' as info;

SELECT 
    id,
    investigacion_id,
    nombre_sesion,
    numero_participantes,
    numero_participantes_esperados,
    usuarios_participantes
FROM libretos_investigacion 
ORDER BY creado_el DESC;

-- 5. Verificar productos existentes
SELECT 
    '=== PRODUCTOS EXISTENTES ===' as info;

SELECT 
    id,
    nombre,
    activo
FROM productos 
ORDER BY nombre;

-- 6. Verificar tipos de investigación
SELECT 
    '=== TIPOS DE INVESTIGACIÓN ===' as info;

SELECT 
    id,
    nombre,
    activo
FROM tipos_investigacion 
ORDER BY nombre;

-- 7. Verificar usuarios (profiles)
SELECT 
    '=== USUARIOS (PROFILES) ===' as info;

SELECT 
    id,
    full_name,
    email,
    created_at
FROM profiles 
ORDER BY created_at DESC
LIMIT 10;

-- 8. Verificar estado_reclutamiento_cat
SELECT 
    '=== ESTADOS DE RECLUTAMIENTO ===' as info;

SELECT 
    id,
    nombre,
    color,
    orden
FROM estado_reclutamiento_cat 
ORDER BY orden; 