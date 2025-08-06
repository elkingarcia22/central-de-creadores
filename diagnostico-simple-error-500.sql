-- Diagnóstico simple del error 500

-- 1. VERIFICAR ESTRUCTURA DE HISTORIAL_PARTICIPACION_PARTICIPANTES
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'historial_participacion_participantes'
ORDER BY ordinal_position;

-- 2. VERIFICAR TRIGGER ACTIVO
SELECT 
    'TRIGGER ACTIVO' as fuente,
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'reclutamientos';

-- 3. DESHABILITAR TRIGGER TEMPORALMENTE
ALTER TABLE reclutamientos DISABLE TRIGGER trigger_participantes_solo;

-- 4. PROBAR INSERT SIN TRIGGER
INSERT INTO reclutamientos (
    id,
    investigacion_id,
    participantes_id
) VALUES (
    gen_random_uuid(),
    '5a832297-4cca-4bad-abe6-3aad99b8b5f3',
    '9155b800-f786-46d7-9294-bb385434d042'
);

-- 5. VERIFICAR SI SE INSERTÓ CORRECTAMENTE
SELECT 
    'INSERT SIN TRIGGER' as fuente,
    COUNT(*) as total_reclutamientos
FROM reclutamientos 
WHERE participantes_id = '9155b800-f786-46d7-9294-bb385434d042'
AND investigacion_id = '5a832297-4cca-4bad-abe6-3aad99b8b5f3';

-- 6. REHABILITAR TRIGGER
ALTER TABLE reclutamientos ENABLE TRIGGER trigger_participantes_solo;

-- 7. VERIFICAR FUNCIÓN DEL TRIGGER
SELECT 
    'FUNCIÓN TRIGGER' as fuente,
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'trigger_participantes_solo'; 