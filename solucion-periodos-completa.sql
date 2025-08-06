-- ================================================
-- SOLUCIÓN COMPLETA PARA PERÍODOS
-- ================================================

-- 1. DESHABILITAR RLS EN TABLA PERIODO
ALTER TABLE periodo DISABLE ROW LEVEL SECURITY;

-- 2. VERIFICAR SI HAY DATOS
SELECT 'Verificando datos actuales en tabla periodo:' as mensaje;
SELECT COUNT(*) as total_periodos FROM periodo;

-- 3. SI NO HAY DATOS, INSERTAR PERÍODOS DE EJEMPLO
DO $$
BEGIN
    IF (SELECT COUNT(*) FROM periodo) = 0 THEN
        RAISE NOTICE 'Tabla periodo está vacía, insertando datos de ejemplo...';
        
        INSERT INTO periodo (id, nombre, etiqueta, ano, trimestre, activo) VALUES
        ('2028-q1', 'Q1 2028', 'Q1 2028', 2028, 1, true),
        ('2028-q2', 'Q2 2028', 'Q2 2028', 2028, 2, true),
        ('2028-q3', 'Q3 2028', 'Q3 2028', 2028, 3, true),
        ('2028-q4', 'Q4 2028', 'Q4 2028', 2028, 4, true),
        ('2027-q1', 'Q1 2027', 'Q1 2027', 2027, 1, true),
        ('2027-q2', 'Q2 2027', 'Q2 2027', 2027, 2, true),
        ('2027-q3', 'Q3 2027', 'Q3 2027', 2027, 3, true),
        ('2027-q4', 'Q4 2027', 'Q4 2027', 2027, 4, true),
        ('2026-q1', 'Q1 2026', 'Q1 2026', 2026, 1, true),
        ('2026-q2', 'Q2 2026', 'Q2 2026', 2026, 2, true),
        ('2026-q3', 'Q3 2026', 'Q3 2026', 2026, 3, true),
        ('2026-q4', 'Q4 2026', 'Q4 2026', 2026, 4, true),
        ('2025-q1', 'Q1 2025', 'Q1 2025', 2025, 1, true),
        ('2025-q2', 'Q2 2025', 'Q2 2025', 2025, 2, true),
        ('2025-q3', 'Q3 2025', 'Q3 2025', 2025, 3, true),
        ('2025-q4', 'Q4 2025', 'Q4 2025', 2025, 4, true),
        ('2024-q1', 'Q1 2024', 'Q1 2024', 2024, 1, true),
        ('2024-q2', 'Q2 2024', 'Q2 2024', 2024, 2, true),
        ('2024-q3', 'Q3 2024', 'Q3 2024', 2024, 3, true),
        ('2024-q4', 'Q4 2024', 'Q4 2024', 2024, 4, true);
        
        RAISE NOTICE 'Datos de ejemplo insertados correctamente';
    ELSE
        RAISE NOTICE 'La tabla periodo ya tiene datos, no se insertaron nuevos';
    END IF;
END $$;

-- 4. VERIFICAR ESTADO FINAL
SELECT 'Estado final de la tabla periodo:' as mensaje;
SELECT COUNT(*) as total_periodos FROM periodo;

-- 5. MOSTRAR ALGUNOS PERÍODOS PARA CONFIRMAR
SELECT 'Períodos disponibles:' as mensaje;
SELECT id, nombre, etiqueta, ano, trimestre 
FROM periodo 
ORDER BY ano DESC, trimestre DESC 
LIMIT 10;

-- 6. VERIFICAR QUE RLS ESTÁ DESHABILITADO
SELECT 'Estado de RLS en tabla periodo:' as mensaje;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'periodo';

-- ¡Listo! Ahora la aplicación debería poder acceder a los períodos 