-- Verificar trigger básico

-- 1. CREAR TRIGGER MUY BÁSICO
CREATE OR REPLACE FUNCTION trigger_basico()
RETURNS TRIGGER AS $func$
BEGIN
    RAISE LOG '🔍 TRIGGER BÁSICO EJECUTADO: reclutamiento_id = %', NEW.id;
    RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

-- 2. CREAR TRIGGER BÁSICO
DROP TRIGGER IF EXISTS trigger_basico ON reclutamientos;
CREATE TRIGGER trigger_basico
    AFTER UPDATE ON reclutamientos
    FOR EACH ROW
    EXECUTE FUNCTION trigger_basico();

-- 3. EJECUTAR TRIGGER BÁSICO
UPDATE reclutamientos 
SET updated_at = NOW()
WHERE id = '758813f1-512e-4566-af82-bcf0915de79c';

-- 4. VERIFICAR TRIGGERS ACTIVOS
SELECT 
  'TRIGGERS ACTIVOS' as fuente,
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'reclutamientos'
ORDER BY trigger_name, event_manipulation;

-- 5. VERIFICAR SI EL UPDATE FUNCIONÓ
SELECT 
  'VERIFICAR UPDATE' as fuente,
  r.id as reclutamiento_id,
  r.updated_at
FROM reclutamientos r
WHERE r.id = '758813f1-512e-4566-af82-bcf0915de79c'; 