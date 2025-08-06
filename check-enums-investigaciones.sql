-- ====================================
-- VERIFICAR VALORES DE ENUMS - INVESTIGACIONES
-- ====================================

-- Ver todos los enums relacionados con investigaciones
SELECT 
    t.typname as enum_name, 
    e.enumlabel as enum_value,
    e.enumsortorder as order_position
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname LIKE 'enum_%'
ORDER BY t.typname, e.enumsortorder;

-- ====================================
-- AGREGAR VALORES FALTANTES A LOS ENUMS
-- ====================================

-- Agregar 'web' al enum_plataforma si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum e 
        JOIN pg_type t ON e.enumtypid = t.oid 
        WHERE t.typname = 'enum_plataforma' AND e.enumlabel = 'web'
    ) THEN
        ALTER TYPE enum_plataforma ADD VALUE 'web';
    END IF;
END $$;

-- Agregar otros valores comunes que podrían faltar
DO $$ 
BEGIN
    -- Para enum_plataforma
    IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'enum_plataforma' AND e.enumlabel = 'mobile') THEN
        ALTER TYPE enum_plataforma ADD VALUE 'mobile';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'enum_plataforma' AND e.enumlabel = 'desktop') THEN
        ALTER TYPE enum_plataforma ADD VALUE 'desktop';
    END IF;
    
    -- Para enum_tipo_prueba
    IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'enum_tipo_prueba' AND e.enumlabel = 'usabilidad') THEN
        ALTER TYPE enum_tipo_prueba ADD VALUE 'usabilidad';
    END IF;
    
    -- Para enum_tipo_sesion
    IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'enum_tipo_sesion' AND e.enumlabel = 'virtual') THEN
        ALTER TYPE enum_tipo_sesion ADD VALUE 'virtual';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'enum_tipo_sesion' AND e.enumlabel = 'presencial') THEN
        ALTER TYPE enum_tipo_sesion ADD VALUE 'presencial';
    END IF;
END $$;

-- ====================================
-- VERIFICAR RESULTADO FINAL
-- ====================================

-- Ver todos los valores después de los cambios
SELECT 
    t.typname as enum_name, 
    e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname IN ('enum_plataforma', 'enum_tipo_prueba', 'enum_tipo_sesion', 'enum_estado_investigacion')
ORDER BY t.typname, e.enumsortorder; 