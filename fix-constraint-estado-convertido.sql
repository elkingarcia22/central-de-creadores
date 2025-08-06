-- ====================================
-- CORREGIR CONSTRAINT CHECK PARA ESTADO 'CONVERTIDO'
-- ====================================

-- 1. Verificar constraint actual
SELECT 
    'Constraint actual:' as info,
    conname,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'seguimientos_investigacion'::regclass 
AND contype = 'c';

-- 2. Eliminar la constraint actual
ALTER TABLE seguimientos_investigacion 
DROP CONSTRAINT seguimientos_investigacion_estado_check;

-- 3. Crear nueva constraint que incluya 'convertido'
ALTER TABLE seguimientos_investigacion 
ADD CONSTRAINT seguimientos_investigacion_estado_check 
CHECK (estado IN ('pendiente', 'en_progreso', 'completado', 'bloqueado', 'cancelado', 'convertido'));

-- 4. Verificar que la nueva constraint se creó correctamente
SELECT 
    'Nueva constraint:' as info,
    conname,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'seguimientos_investigacion'::regclass 
AND contype = 'c';

-- 5. Verificar que podemos insertar un seguimiento con estado 'convertido'
-- (comentado por seguridad, descomenta si quieres probar)
-- INSERT INTO seguimientos_investigacion (investigacion_id, fecha_seguimiento, notas, responsable_id, estado, creado_por)
-- VALUES ('74ccfacb-6776-4546-a3e9-c07cefd1d6f1', CURRENT_DATE, 'Prueba de estado convertido', 
--         (SELECT id FROM profiles LIMIT 1), 'convertido', auth.uid())
-- ON CONFLICT DO NOTHING;

-- 6. Verificar seguimientos convertidos existentes
SELECT 
    'Seguimientos convertidos existentes:' as info,
    COUNT(*) as total_convertidos
FROM seguimientos_investigacion 
WHERE estado = 'convertido';

-- 7. Mostrar seguimientos convertidos
SELECT 
    'Seguimientos convertidos:' as info,
    id,
    estado,
    fecha_seguimiento,
    investigacion_id
FROM seguimientos_investigacion 
WHERE estado = 'convertido'
ORDER BY fecha_seguimiento DESC; 