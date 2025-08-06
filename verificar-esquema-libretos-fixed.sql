-- ====================================
-- VERIFICAR ESQUEMA DE TABLA LIBRETOS_INVESTIGACION (COMPATIBLE SUPABASE)
-- ====================================

-- 1. VERIFICAR SI LA TABLA EXISTE
SELECT 
    table_name,
    table_schema,
    table_type
FROM information_schema.tables 
WHERE table_name = 'libretos_investigacion' 
AND table_schema = 'public';

-- 2. ESTRUCTURA COMPLETA DE LA TABLA
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length,
    numeric_precision,
    numeric_scale,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'libretos_investigacion' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. VERIFICAR FOREIGN KEYS
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'libretos_investigacion';

-- 4. VERIFICAR ÍNDICES
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'libretos_investigacion';

-- 5. VERIFICAR RLS (Row Level Security) - VERSIÓN COMPATIBLE
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'libretos_investigacion';

-- 6. VERIFICAR POLÍTICAS RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'libretos_investigacion';

-- 7. CONTEO DE REGISTROS (con manejo de errores)
DO $$
BEGIN
    BEGIN
        PERFORM COUNT(*) FROM libretos_investigacion;
        RAISE NOTICE 'Tabla libretos_investigacion es accesible';
    EXCEPTION
        WHEN others THEN
            RAISE NOTICE 'Error accediendo a libretos_investigacion: %', SQLERRM;
    END;
END $$;

-- 8. VERIFICAR TABLAS RELACIONADAS
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'plataformas_cat',
    'tipos_prueba_cat', 
    'roles_empresa',
    'industrias',
    'modalidades',
    'tamano_empresa',
    'investigaciones'
)
ORDER BY table_name;

-- 9. VERIFICAR COLUMNAS ESPECÍFICAS QUE NECESITAMOS
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'libretos_investigacion' 
            AND column_name = 'duracion_estimada'
        ) THEN 'SÍ' 
        ELSE 'NO' 
    END as tiene_duracion_estimada,
    
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'libretos_investigacion' 
            AND column_name = 'link_prototipo'
        ) THEN 'SÍ' 
        ELSE 'NO' 
    END as tiene_link_prototipo,
    
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'libretos_investigacion' 
            AND column_name = 'tipo_prueba_id'
        ) THEN 'SÍ' 
        ELSE 'NO' 
    END as tiene_tipo_prueba_id,
    
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'libretos_investigacion' 
            AND column_name = 'pais_id'
        ) THEN 'SÍ' 
        ELSE 'NO' 
    END as tiene_pais_id;

-- 10. DIAGNÓSTICO FINAL
SELECT 
    'DIAGNÓSTICO: ' || 
    CASE 
        WHEN NOT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'libretos_investigacion'
        ) THEN 'TABLA NO EXISTE - Necesita ser creada'
        WHEN NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'libretos_investigacion' 
            AND column_name = 'duracion_estimada'
        ) THEN 'COLUMNAS FALTANTES - Necesita migración'
        ELSE 'TABLA COMPLETA - Verificar RLS o permisos'
    END as diagnostico; 