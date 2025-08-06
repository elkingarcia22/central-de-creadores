-- Diagnosticar error 500 al crear reclutamientos

-- 1. VERIFICAR LOGS DE ERRORES
SELECT 
    'LOGS RECIENTES' as fuente,
    log_time,
    message
FROM pg_stat_activity 
WHERE state = 'active' 
AND query LIKE '%reclutamientos%'
ORDER BY log_time DESC
LIMIT 10;

-- 2. VERIFICAR ESTRUCTURA DE HISTORIAL_PARTICIPACION_PARTICIPANTES
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'historial_participacion_participantes'
ORDER BY ordinal_position;

-- 3. VERIFICAR TRIGGER ACTIVO
SELECT 
    'TRIGGER ACTIVO' as fuente,
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'reclutamientos';

-- 4. VERIFICAR FUNCIÓN DEL TRIGGER
SELECT 
    'FUNCIÓN TRIGGER' as fuente,
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'trigger_participantes_solo';

-- 5. PROBAR INSERT SIMPLE SIN TRIGGER
-- Deshabilitar trigger temporalmente
ALTER TABLE reclutamientos DISABLE TRIGGER trigger_participantes_solo;

-- 6. VERIFICAR SI SE PUEDE INSERTAR SIN TRIGGER
INSERT INTO reclutamientos (
    id,
    investigacion_id,
    participantes_id
) VALUES (
    gen_random_uuid(),
    '5a832297-4cca-4bad-abe6-3aad99b8b5f3',
    '9155b800-f786-46d7-9294-bb385434d042'
);

-- 7. REHABILITAR TRIGGER
ALTER TABLE reclutamientos ENABLE TRIGGER trigger_participantes_solo; 