-- ====================================
-- VERIFICAR TABLAS RELACIONADAS PARA EMPRESAS
-- ====================================

-- Verificar si existen las tablas relacionadas
SELECT '=== VERIFICAR TABLAS RELACIONADAS ===' as info;

-- 1. Verificar estado_empresa_cat
SELECT 
    'estado_empresa_cat' as tabla,
    EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'estado_empresa_cat' 
        AND table_schema = 'public'
    ) as existe,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'estado_empresa_cat' 
            AND table_schema = 'public'
        ) THEN (SELECT COUNT(*) FROM estado_empresa_cat)
        ELSE 0
    END as total_registros;

-- 2. Verificar relacion_empresa_cat
SELECT 
    'relacion_empresa_cat' as tabla,
    EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'relacion_empresa_cat' 
        AND table_schema = 'public'
    ) as existe,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'relacion_empresa_cat' 
            AND table_schema = 'public'
        ) THEN (SELECT COUNT(*) FROM relacion_empresa_cat)
        ELSE 0
    END as total_registros;

-- 3. Verificar tamano_empresa
SELECT 
    'tamano_empresa' as tabla,
    EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'tamano_empresa' 
        AND table_schema = 'public'
    ) as existe,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'tamano_empresa' 
            AND table_schema = 'public'
        ) THEN (SELECT COUNT(*) FROM tamano_empresa)
        ELSE 0
    END as total_registros;

-- 4. Verificar modalidades
SELECT 
    'modalidades' as tabla,
    EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'modalidades' 
        AND table_schema = 'public'
    ) as existe,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'modalidades' 
            AND table_schema = 'public'
        ) THEN (SELECT COUNT(*) FROM modalidades)
        ELSE 0
    END as total_registros; 