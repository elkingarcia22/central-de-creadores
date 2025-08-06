-- ====================================
-- SCRIPT COMPLETO DE TRAZABILIDAD
-- ====================================
-- Este script implementa la trazabilidad completa entre seguimientos e investigaciones
-- Incluye: conversión, restauración, completado y navegación entre investigaciones

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

-- 6. Crear el trigger para restaurar seguimientos
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

-- 9. Crear función para obtener trazabilidad completa
CREATE OR REPLACE FUNCTION obtener_trazabilidad_completa(inv_id UUID)
RETURNS JSON AS $$
DECLARE
  resultado JSON;
BEGIN
  WITH trazabilidad AS (
    -- Seguimientos que dieron origen a esta investigación
    SELECT 
      'origen' as tipo,
      s.id as seguimiento_id,
      s.fecha_seguimiento,
      s.notas,
      s.estado as estado_seguimiento,
      s.responsable_id,
      s.investigacion_id,
      i.nombre as investigacion_nombre,
      i.estado as estado_investigacion,
      i.fecha_inicio,
      i.fecha_fin
    FROM seguimientos_investigacion s
    LEFT JOIN investigaciones i ON s.investigacion_id = i.id
    WHERE s.investigacion_derivada_id = inv_id
    
    UNION ALL
    
    -- Investigaciones que se crearon desde seguimientos de esta investigación
    SELECT 
      'derivada' as tipo,
      s.id as seguimiento_id,
      s.fecha_seguimiento,
      s.notas,
      s.estado as estado_seguimiento,
      s.responsable_id,
      i.id as investigacion_id,
      i.nombre as investigacion_nombre,
      i.estado as estado_investigacion,
      i.fecha_inicio,
      i.fecha_fin
    FROM investigaciones i
    LEFT JOIN seguimientos_investigacion s ON s.investigacion_derivada_id = i.id
    WHERE s.investigacion_id = inv_id
  )
  SELECT json_build_object(
    'investigacion_actual', inv_id,
    'trazabilidad', json_agg(
      json_build_object(
        'tipo', t.tipo,
        'seguimiento_id', t.seguimiento_id,
        'fecha_seguimiento', t.fecha_seguimiento,
        'notas', t.notas,
        'estado_seguimiento', t.estado_seguimiento,
        'responsable_id', t.responsable_id,
        'investigacion_id', t.investigacion_id,
        'investigacion_nombre', t.investigacion_nombre,
        'estado_investigacion', t.estado_investigacion,
        'fecha_inicio', t.fecha_inicio,
        'fecha_fin', t.fecha_fin
      )
    )
  ) INTO resultado
  FROM trazabilidad t;
  
  RETURN COALESCE(resultado, json_build_object('investigacion_actual', inv_id, 'trazabilidad', '[]'::json));
END;
$$ LANGUAGE plpgsql;

-- 10. Crear vista para facilitar consultas de trazabilidad
CREATE OR REPLACE VIEW vista_trazabilidad_completa AS
SELECT 
  i.id as investigacion_actual_id,
  i.nombre as investigacion_actual_nombre,
  i.estado as investigacion_actual_estado,
  
  -- Origen
  s_origen.id as seguimiento_origen_id,
  s_origen.fecha_seguimiento as seguimiento_origen_fecha,
  s_origen.notas as seguimiento_origen_notas,
  s_origen.estado as seguimiento_origen_estado,
  inv_origen.id as investigacion_origen_id,
  inv_origen.nombre as investigacion_origen_nombre,
  inv_origen.estado as investigacion_origen_estado,
  
  -- Derivadas
  s_derivada.id as seguimiento_derivada_id,
  s_derivada.fecha_seguimiento as seguimiento_derivada_fecha,
  s_derivada.notas as seguimiento_derivada_notas,
  s_derivada.estado as seguimiento_derivada_estado,
  inv_derivada.id as investigacion_derivada_id,
  inv_derivada.nombre as investigacion_derivada_nombre,
  inv_derivada.estado as investigacion_derivada_estado
  
FROM investigaciones i
-- Seguimientos que dieron origen a esta investigación
LEFT JOIN seguimientos_investigacion s_origen ON s_origen.investigacion_derivada_id = i.id
LEFT JOIN investigaciones inv_origen ON s_origen.investigacion_id = inv_origen.id
-- Seguimientos de esta investigación que dieron origen a otras investigaciones
LEFT JOIN seguimientos_investigacion s_derivada ON s_derivada.investigacion_id = i.id
LEFT JOIN investigaciones inv_derivada ON s_derivada.investigacion_derivada_id = inv_derivada.id;

-- 11. Verificar que los cambios se aplicaron correctamente
SELECT 
  'Columna investigacion_derivada_id' as verificación,
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'seguimientos_investigacion' 
AND column_name = 'investigacion_derivada_id';

-- 12. Verificar la constraint actualizada
SELECT 
  'Constraint estado' as verificación,
  constraint_name, 
  check_clause
FROM information_schema.check_constraints 
WHERE constraint_name = 'seguimientos_investigacion_estado_check';

-- 13. Verificar que los triggers se crearon
SELECT 
  'Triggers creados' as verificación,
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers 
WHERE trigger_name IN ('trigger_restaurar_seguimientos', 'trigger_completar_seguimientos');

-- 14. Verificar función de trazabilidad
SELECT 
  'Función trazabilidad' as verificación,
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_name = 'obtener_trazabilidad_completa';

-- 15. Verificar vista de trazabilidad
SELECT 
  'Vista trazabilidad' as verificación,
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_name = 'vista_trazabilidad_completa';

-- 16. Mensaje de confirmación
SELECT '✅ Trazabilidad completa implementada correctamente' as resultado; 