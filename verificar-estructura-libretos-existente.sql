-- ====================================
-- VERIFICAR ESTRUCTURA DE LIBRETOS EXISTENTE
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar estructura de la tabla libretos existente
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'libretos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Ver algunos datos de ejemplo de libretos
SELECT * FROM libretos LIMIT 5;

-- 3. Verificar relación entre investigaciones y libretos
SELECT 
    i.id as investigacion_id,
    i.nombre as investigacion_nombre,
    i.estado as investigacion_estado,
    i.libreto as libreto_id,
    l.id as libreto_id_directo,
    l.titulo as libreto_titulo,
    l.descripcion as libreto_descripcion
FROM investigaciones i
LEFT JOIN libretos l ON i.libreto = l.id
WHERE i.estado = 'por_agendar'
LIMIT 5;

-- 4. Verificar si existe columna numero_participantes en libretos
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'libretos' 
AND column_name = 'numero_participantes'
AND table_schema = 'public';

-- 5. Verificar si existe columna participantes en libretos
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'libretos' 
AND column_name ILIKE '%participante%'
AND table_schema = 'public'; 