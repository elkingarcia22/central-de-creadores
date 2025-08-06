-- ====================================
-- VERIFICAR TABLAS RELACIONADAS FALTANTES
-- ====================================

-- Verificar las tablas que faltan
SELECT '=== VERIFICAR TABLAS FALTANTES ===' as info;

-- 1. Verificar relacion_empresa (sin _cat)
SELECT 
    'relacion_empresa' as tabla,
    EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'relacion_empresa' 
        AND table_schema = 'public'
    ) as existe;

-- 2. Verificar relacion_empresa_cat
SELECT 
    'relacion_empresa_cat' as tabla,
    EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'relacion_empresa_cat' 
        AND table_schema = 'public'
    ) as existe;

-- 3. Verificar tamano_empresa
SELECT 
    'tamano_empresa' as tabla,
    EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'tamano_empresa' 
        AND table_schema = 'public'
    ) as existe;

-- 4. Verificar tamano_empresa_cat
SELECT 
    'tamano_empresa_cat' as tabla,
    EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'tamano_empresa_cat' 
        AND table_schema = 'public'
    ) as existe; 