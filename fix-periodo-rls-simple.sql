-- ================================================
-- SOLUCIÓN SIMPLE: DESHABILITAR RLS EN TABLA PERIODO
-- ================================================

-- Los datos ya existen, solo necesitamos deshabilitar RLS
ALTER TABLE periodo DISABLE ROW LEVEL SECURITY;

-- Verificar que RLS está deshabilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'periodo';

-- Verificar cuántos períodos tienes
SELECT COUNT(*) as total_periodos FROM periodo;

-- Mostrar algunos períodos para confirmar
SELECT etiqueta, ano, trimestre, fecha_inicio::date, fecha_fin::date 
FROM periodo 
ORDER BY ano DESC, trimestre DESC 
LIMIT 10;

-- ¡Listo! Ahora la aplicación debería poder acceder a los períodos 