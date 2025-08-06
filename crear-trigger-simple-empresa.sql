-- Crear trigger simple para empresas

-- 1. CREAR TRIGGER SIMPLE PARA EMPRESAS
CREATE OR REPLACE FUNCTION trigger_empresas_simple()
RETURNS TRIGGER AS $func$
BEGIN
    -- Solo procesar si el estado es 'Finalizado'
    IF NEW.estado_agendamiento = (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'Finalizado') THEN
        
        -- INSERTAR EMPRESA DIRECTAMENTE
        INSERT INTO historial_participacion_empresas (
            empresa_id, reclutamiento_id, investigacion_id, participante_id,
            fecha_participacion, estado_sesion, duracion_sesion,
            created_at, updated_at
        ) VALUES (
            (SELECT empresa_id FROM participantes WHERE id = NEW.participantes_id),
            NEW.id, NEW.investigacion_id, NEW.participantes_id,
            NEW.fecha_sesion, 'completada', NEW.duracion_sesion,
            NOW(), NOW()
        );
        
        RAISE LOG '✅ Trigger simple: Insertada empresa para reclutamiento %', NEW.id;
        
    END IF;
    
    RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

-- 2. CREAR TRIGGER SIMPLE
DROP TRIGGER IF EXISTS trigger_empresas_simple ON reclutamientos;
CREATE TRIGGER trigger_empresas_simple
    AFTER UPDATE ON reclutamientos
    FOR EACH ROW
    EXECUTE FUNCTION trigger_empresas_simple();

-- 3. FORZAR EJECUCIÓN DEL TRIGGER SIMPLE
UPDATE reclutamientos 
SET updated_at = NOW()
WHERE id = '758813f1-512e-4566-af82-bcf0915de79c';

-- 4. VERIFICAR RESULTADO
SELECT 
  'RESULTADO TRIGGER SIMPLE' as fuente,
  COUNT(*) as total_registros
FROM historial_participacion_empresas;

-- 5. VERIFICAR DATOS INSERTADOS
SELECT 
  'DATOS INSERTADOS' as fuente,
  hpe.id,
  hpe.empresa_id,
  hpe.reclutamiento_id,
  hpe.estado_sesion
FROM historial_participacion_empresas hpe; 