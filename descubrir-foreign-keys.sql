-- =====================================================
-- DESCUBRIR FOREIGN KEYS DE LA TABLA EMPRESAS
-- =====================================================

-- 1. VER TODAS LAS FOREIGN KEYS DE LA TABLA EMPRESAS
-- =====================================================
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name='empresas';

-- 2. VER TODAS LAS COLUMNAS DE LA TABLA EMPRESAS
-- =====================================================
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'empresas' 
ORDER BY ordinal_position;

-- 3. VER UNA MUESTRA DE DATOS DE EMPRESAS
-- =====================================================
SELECT * FROM empresas LIMIT 3;

-- 4. VER ESTRUCTURA DE TABLAS DE CATÁLOGOS
-- =====================================================

-- Estructura de paises
SELECT 'PAISES' as tabla, column_name, data_type FROM information_schema.columns WHERE table_name = 'paises' ORDER BY ordinal_position;

-- Estructura de industrias  
SELECT 'INDUSTRIAS' as tabla, column_name, data_type FROM information_schema.columns WHERE table_name = 'industrias' ORDER BY ordinal_position;

-- Estructura de tamano_empresa
SELECT 'TAMANO_EMPRESA' as tabla, column_name, data_type FROM information_schema.columns WHERE table_name = 'tamano_empresa' ORDER BY ordinal_position;

-- Estructura de modalidades
SELECT 'MODALIDADES' as tabla, column_name, data_type FROM information_schema.columns WHERE table_name = 'modalidades' ORDER BY ordinal_position;

-- Estructura de relaciones
SELECT 'RELACIONES' as tabla, column_name, data_type FROM information_schema.columns WHERE table_name = 'relaciones' ORDER BY ordinal_position;

-- Estructura de estado_empresa
SELECT 'ESTADO_EMPRESA' as tabla, column_name, data_type FROM information_schema.columns WHERE table_name = 'estado_empresa' ORDER BY ordinal_position;

-- Estructura de kams
SELECT 'KAMS' as tabla, column_name, data_type FROM information_schema.columns WHERE table_name = 'kams' ORDER BY ordinal_position;

-- Estructura de productos
SELECT 'PRODUCTOS' as tabla, column_name, data_type FROM information_schema.columns WHERE table_name = 'productos' ORDER BY ordinal_position;

-- Estructura de unidades_negocio
SELECT 'UNIDADES_NEGOCIO' as tabla, column_name, data_type FROM information_schema.columns WHERE table_name = 'unidades_negocio' ORDER BY ordinal_position;
