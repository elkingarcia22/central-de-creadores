-- ====================================
-- CORREGIR TRIGGER DE DOLORES COMPLETO
-- ====================================

-- 1. Eliminar TODOS los triggers problemáticos
DROP TRIGGER IF EXISTS update_dolores_participantes_updated_at ON dolores_participantes;
DROP TRIGGER IF EXISTS update_categorias_dolores_updated_at ON categorias_dolores;

-- 2. Eliminar la función problemática
DROP FUNCTION IF EXISTS update_updated_at_column();

-- 3. Crear función corregida para actualizar fecha_actualizacion
CREATE OR REPLACE FUNCTION update_fecha_actualizacion_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. Crear trigger corregido para dolores_participantes
CREATE TRIGGER update_dolores_participantes_fecha_actualizacion 
    BEFORE UPDATE ON dolores_participantes 
    FOR EACH ROW EXECUTE FUNCTION update_fecha_actualizacion_column();

-- 5. Verificar que el trigger se creó correctamente
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'dolores_participantes';

-- 6. Verificar que la función existe
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name = 'update_fecha_actualizacion_column';

-- 7. Probar actualización manual para verificar (descomentar para probar)
-- UPDATE dolores_participantes 
-- SET titulo = titulo 
-- WHERE id = (SELECT id FROM dolores_participantes LIMIT 1);

-- 8. Verificar estructura de la tabla
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'dolores_participantes'
AND column_name IN ('fecha_actualizacion', 'updated_at')
ORDER BY column_name;
