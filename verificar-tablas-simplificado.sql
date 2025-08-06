-- ====================================
-- VERIFICAR SI EXISTEN LAS TABLAS RELACIONADAS
-- ====================================

-- Verificar si existen las tablas relacionadas (solo existencia, sin contar registros)
SELECT '=== VERIFICAR EXISTENCIA DE TABLAS ===' as info;

-- 1. Verificar estado_empresa_cat
SELECT 
    'estado_empresa_cat' as tabla,
    EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'estado_empresa_cat' 
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

-- 4. Verificar modalidades
SELECT 
    'modalidades' as tabla,
    EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'modalidades' 
        AND table_schema = 'public'
    ) as existe; 