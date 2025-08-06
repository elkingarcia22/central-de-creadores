-- Función para calcular el nivel de riesgo automáticamente
CREATE OR REPLACE FUNCTION calcular_nivel_riesgo(
  estado_investigacion TEXT,
  fecha_fin DATE
) RETURNS TEXT AS $$
BEGIN
  -- Si la investigación está finalizada o cancelada, no hay riesgo
  IF estado_investigacion IN ('finalizado', 'cancelado') THEN
    RETURN 'completado';
  END IF;

  -- Si no hay fecha de fin, no se puede calcular el riesgo
  IF fecha_fin IS NULL THEN
    RETURN 'sin_fecha';
  END IF;

  -- Calcular días restantes hasta la fecha de finalización
  DECLARE
    dias_restantes INTEGER := fecha_fin - CURRENT_DATE;
  BEGIN
    -- Determinar nivel de riesgo basado en días restantes
    IF dias_restantes < 0 THEN
      RETURN 'alto';  -- Vencida
    ELSIF dias_restantes <= 7 THEN
      RETURN 'alto';  -- Vence en 7 días o menos
    ELSIF dias_restantes <= 30 THEN
      RETURN 'medio'; -- Vence en 30 días o menos
    ELSE
      RETURN 'bajo';  -- Vence en más de 30 días
    END IF;
  END;
END;
$$ LANGUAGE plpgsql;

-- Función de trigger para actualizar automáticamente el nivel de riesgo
CREATE OR REPLACE FUNCTION actualizar_riesgo_automatico()
RETURNS TRIGGER AS $$
BEGIN
  -- Calcular y asignar el nuevo nivel de riesgo
  NEW.riesgo := calcular_nivel_riesgo(NEW.estado, NEW.fecha_fin);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger que se ejecuta antes de INSERT y UPDATE
DROP TRIGGER IF EXISTS trigger_actualizar_riesgo ON investigaciones;
CREATE TRIGGER trigger_actualizar_riesgo
  BEFORE INSERT OR UPDATE OF estado, fecha_fin
  ON investigaciones
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_riesgo_automatico();

-- Actualizar registros existentes con el nuevo cálculo de riesgo
UPDATE investigaciones 
SET riesgo = calcular_nivel_riesgo(estado, fecha_fin)
WHERE riesgo IS NULL OR riesgo != calcular_nivel_riesgo(estado, fecha_fin);

-- Verificar que el trigger funciona
SELECT 
  id,
  nombre,
  estado,
  fecha_fin,
  riesgo,
  calcular_nivel_riesgo(estado, fecha_fin) as riesgo_calculado
FROM investigaciones
LIMIT 10; 