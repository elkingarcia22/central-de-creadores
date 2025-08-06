-- Trigger con inserción directa

-- 1. CREAR TRIGGER CON INSERCIÓN DIRECTA
CREATE OR REPLACE FUNCTION trigger_insercion_directa()
RETURNS TRIGGER AS $func$
BEGIN
    RAISE LOG '🔍 TRIGGER INSERCIÓN DIRECTA EJECUTADO: reclutamiento_id = %', NEW.id;
    
    -- INSERTAR DIRECTAMENTE SIN CONDICIONES
    INSERT INTO historial_participacion_empresas (
        empresa_id, reclutamiento_id, investigacion_id, participante_id,
        fecha_participacion, estado_sesion, duracion_sesion,
        created_at, updated_at
    ) VALUES (
        '56ae11ec-f6b4-4066-9414-e51adfbebee2', -- empresa_id fijo
        NEW.id, 
        NEW.investigacion_id, 
        NEW.participantes_id,
        NEW.fecha_sesion, 
        'completada', 
        COALESCE(NEW.duracion_sesion, 60),
        NOW(), 
        NOW()
    );
    
    RAISE LOG '✅ INSERCIÓN DIRECTA EXITOSA para reclutamiento %', NEW.id;
    RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

-- 2. CREAR TRIGGER
DROP TRIGGER IF EXISTS trigger_insercion_directa ON reclutamientos;
CREATE TRIGGER trigger_insercion_directa
    AFTER UPDATE ON reclutamientos
    FOR EACH ROW
    EXECUTE FUNCTION trigger_insercion_directa();

-- 3. EJECUTAR TRIGGER
UPDATE reclutamientos 
SET updated_at = NOW()
WHERE id = '758813f1-512e-4566-af82-bcf0915de79c';

-- 4. VERIFICAR RESULTADO
SELECT 
  'RESULTADO INSERCIÓN DIRECTA' as fuente,
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