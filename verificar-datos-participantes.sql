-- ====================================
-- VERIFICAR DATOS REALES DE PARTICIPANTES
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar estructura de la tabla participantes
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'participantes'
ORDER BY ordinal_position;

-- 2. Verificar datos de participantes
SELECT 
    id,
    nombre,
    email,
    telefono,
    empresa,
    cargo,
    edad,
    genero,
    ubicacion,
    experiencia_ux,
    dispositivos,
    frecuencia_uso,
    comentarios,
    estado,
    fecha_creacion
FROM participantes
ORDER BY fecha_creacion DESC;

-- 3. Verificar relación con reclutamientos
SELECT 
    r.id as reclutamiento_id,
    r.participantes_id,
    p.nombre as participante_nombre,
    p.email as participante_email,
    p.empresa as participante_empresa,
    p.cargo as participante_cargo
FROM reclutamientos r
LEFT JOIN participantes p ON r.participantes_id = p.id
ORDER BY r.fecha_asignado DESC;

-- 4. Verificar permisos RLS en participantes
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'participantes';

-- 5. Verificar si RLS está habilitado en participantes
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'participantes'; 