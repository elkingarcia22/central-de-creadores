-- =============================================
-- OPCIÓN RÁPIDA: DESHABILITAR RLS TEMPORALMENTE
-- =============================================
-- Esta es la solución MÁS RÁPIDA para que puedas trabajar inmediatamente

-- DESHABILITAR RLS EN TODAS LAS TABLAS PROBLEMÁTICAS
ALTER TABLE investigaciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE productos DISABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_investigacion DISABLE ROW LEVEL SECURITY;
ALTER TABLE periodo DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- VERIFICAR QUE RLS ESTÁ DESHABILITADO
SELECT 
    'ESTADO RLS:' as categoria,
    tablename,
    CASE 
        WHEN rowsecurity = false THEN '✅ DESHABILITADO'
        ELSE '❌ HABILITADO'
    END as estado
FROM pg_tables 
WHERE tablename IN ('investigaciones', 'productos', 'tipos_investigacion', 'periodo', 'profiles', 'user_roles')
ORDER BY tablename;

-- MENSAJE FINAL
SELECT 
    '🚀 RLS DESHABILITADO' as resultado,
    'Ahora puedes crear investigaciones sin problemas' as mensaje,
    'Recarga la aplicación y prueba' as instruccion;

-- =============================================
-- PARA REACTIVAR RLS MÁS TARDE (CUANDO TENGAS TIEMPO):
-- =============================================
/*
ALTER TABLE investigaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_investigacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE periodo ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
*/ 