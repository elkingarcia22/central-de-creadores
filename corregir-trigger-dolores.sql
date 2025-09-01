-- ====================================
-- CORREGIR TRIGGER DE DOLORES
-- ====================================

-- 1. Eliminar el trigger problemático
DROP TRIGGER IF EXISTS update_dolores_participantes_updated_at ON dolores_participantes;

-- 2. Crear función corregida para actualizar fecha_actualizacion
CREATE OR REPLACE FUNCTION update_fecha_actualizacion_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 3. Crear trigger corregido
CREATE TRIGGER update_dolores_participantes_fecha_actualizacion 
    BEFORE UPDATE ON dolores_participantes 
    FOR EACH ROW EXECUTE FUNCTION update_fecha_actualizacion_column();

-- 4. Verificar que el trigger se creó correctamente
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'dolores_participantes';

-- 5. Probar actualización manual para verificar
-- UPDATE dolores_participantes SET estado = estado WHERE id = (SELECT id FROM dolores_participantes LIMIT 1);
