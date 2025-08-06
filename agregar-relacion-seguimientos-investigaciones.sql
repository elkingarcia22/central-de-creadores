-- Script para agregar relación entre seguimientos e investigaciones
-- Esto permitirá mantener la trazabilidad cuando se convierten seguimientos en investigaciones

-- 1. Agregar columna para relacionar seguimientos con investigaciones
ALTER TABLE seguimientos_investigacion 
ADD COLUMN IF NOT EXISTS investigacion_derivada_id UUID REFERENCES investigaciones(id) ON DELETE SET NULL;

-- 2. Agregar comentario explicativo
COMMENT ON COLUMN seguimientos_investigacion.investigacion_derivada_id IS 
'ID de la investigación creada desde este seguimiento. Permite trazabilidad cuando se elimina la investigación.';

-- 3. Crear índice para mejorar performance de consultas
CREATE INDEX IF NOT EXISTS idx_seguimientos_investigacion_derivada 
ON seguimientos_investigacion(investigacion_derivada_id);

-- 4. Actualizar la constraint CHECK para incluir el estado 'completado'
ALTER TABLE seguimientos_investigacion 
DROP CONSTRAINT IF EXISTS seguimientos_investigacion_estado_check;

ALTER TABLE seguimientos_investigacion 
ADD CONSTRAINT seguimientos_investigacion_estado_check 
CHECK (estado IN ('pendiente', 'en_progreso', 'convertido', 'completado'));

-- 5. Crear trigger para restaurar seguimientos cuando se elimina una investigación
CREATE OR REPLACE FUNCTION restaurar_seguimientos_al_eliminar_investigacion()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar seguimientos relacionados a estado 'pendiente'
  UPDATE seguimientos_investigacion 
  SET 
    estado = 'pendiente',
    investigacion_derivada_id = NULL,
    updated_at = NOW()
  WHERE investigacion_derivada_id = OLD.id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- 6. Crear el trigger
DROP TRIGGER IF EXISTS trigger_restaurar_seguimientos ON investigaciones;
CREATE TRIGGER trigger_restaurar_seguimientos
  BEFORE DELETE ON investigaciones
  FOR EACH ROW
  EXECUTE FUNCTION restaurar_seguimientos_al_eliminar_investigacion();

-- 7. Crear trigger para actualizar seguimientos cuando la investigación se complete
CREATE OR REPLACE FUNCTION actualizar_seguimientos_al_completar_investigacion()
RETURNS TRIGGER AS $$
BEGIN
  -- Si la investigación se marcó como finalizada, actualizar seguimientos relacionados
  IF NEW.estado = 'finalizado' AND OLD.estado != 'finalizado' THEN
    UPDATE seguimientos_investigacion 
    SET 
      estado = 'completado',
      updated_at = NOW()
    WHERE investigacion_derivada_id = NEW.id AND estado = 'convertido';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Crear el trigger para completar seguimientos
DROP TRIGGER IF EXISTS trigger_completar_seguimientos ON investigaciones;
CREATE TRIGGER trigger_completar_seguimientos
  AFTER UPDATE ON investigaciones
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_seguimientos_al_completar_investigacion();

-- 9. Verificar que los cambios se aplicaron correctamente
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'seguimientos_investigacion' 
AND column_name = 'investigacion_derivada_id';

-- 10. Verificar la constraint actualizada
SELECT 
  constraint_name, 
  check_clause
FROM information_schema.check_constraints 
WHERE constraint_name = 'seguimientos_investigacion_estado_check'; 