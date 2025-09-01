-- ====================================
-- DESHABILITAR TRIGGER PROBLEMÁTICO
-- ====================================

-- 1. Deshabilitar el trigger problemático
ALTER TABLE dolores_participantes DISABLE TRIGGER update_dolores_participantes_updated_at;

-- 2. Verificar que el trigger está deshabilitado
SELECT 
    schemaname,
    tablename,
    triggername,
    tgisdisabled
FROM pg_trigger 
WHERE tgname = 'update_dolores_participantes_updated_at';

-- 3. Verificar todos los triggers de la tabla
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'dolores_participantes';

-- 4. Probar una actualización manual para verificar
-- UPDATE dolores_participantes 
-- SET estado = 'resuelto', fecha_actualizacion = NOW() 
-- WHERE id = 'e58c16bf-6087-4956-809b-0efa1e931ff9' 
-- RETURNING id, estado, fecha_actualizacion;
