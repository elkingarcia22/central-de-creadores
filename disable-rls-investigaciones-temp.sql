-- ====================================
-- SOLUCIÓN RÁPIDA: Deshabilitar RLS temporalmente
-- ====================================

-- OPCIÓN 1: Deshabilitar RLS completamente (MÁS RÁPIDO)
ALTER TABLE investigaciones DISABLE ROW LEVEL SECURITY;

-- OPCIÓN 2: Solo eliminar las políticas problemáticas
-- DROP POLICY IF EXISTS "Usuarios pueden ver investigaciones" ON investigaciones;
-- DROP POLICY IF EXISTS "Usuarios pueden crear investigaciones" ON investigaciones;

-- Verificar estado de RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    forcerowsecurity
FROM pg_tables 
WHERE tablename = 'investigaciones';

-- ====================================
-- PARA REACTIVAR RLS DESPUÉS (cuando esté solucionado):
-- ALTER TABLE investigaciones ENABLE ROW LEVEL SECURITY;
-- ==================================== 