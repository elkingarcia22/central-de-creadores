-- ====================================
-- CORREGIR TRIGGERS SEGUIMIENTOS_INVESTIGACION
-- ====================================

-- 1. VERIFICAR TRIGGERS ACTUALES
SELECT '=== TRIGGERS ACTUALES ===' as info;

SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'seguimientos_investigacion'
AND event_object_schema = 'public';

-- 2. ELIMINAR TRIGGERS PROBLEMÁTICOS
SELECT '=== ELIMINANDO TRIGGERS PROBLEMÁTICOS ===' as info;

DROP TRIGGER IF EXISTS trigger_restaurar_seguimientos ON investigaciones;
DROP TRIGGER IF EXISTS trigger_completar_seguimientos ON investigaciones;

-- 3. CORREGIR FUNCIONES DE TRIGGERS
SELECT '=== CORRIGIENDO FUNCIONES ===' as info;

-- Corregir función para restaurar seguimientos
CREATE OR REPLACE FUNCTION restaurar_seguimientos_al_eliminar_investigacion()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar seguimientos relacionados a estado 'pendiente'
  UPDATE seguimientos_investigacion 
  SET 
    estado = 'pendiente',
    investigacion_derivada_id = NULL,
    actualizado_el = NOW()
  WHERE investigacion_derivada_id = OLD.id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Corregir función para completar seguimientos
CREATE OR REPLACE FUNCTION actualizar_seguimientos_al_completar_investigacion()
RETURNS TRIGGER AS $$
BEGIN
  -- Si la investigación se marcó como finalizada, actualizar seguimientos relacionados
  IF NEW.estado = 'finalizado' AND OLD.estado != 'finalizado' THEN
    UPDATE seguimientos_investigacion 
    SET 
      estado = 'completado',
      actualizado_el = NOW()
    WHERE investigacion_derivada_id = NEW.id AND estado = 'convertido';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. RECREAR TRIGGERS CORREGIDOS
SELECT '=== RECREANDO TRIGGERS ===' as info;

-- Trigger para restaurar seguimientos
CREATE TRIGGER trigger_restaurar_seguimientos
  BEFORE DELETE ON investigaciones
  FOR EACH ROW
  EXECUTE FUNCTION restaurar_seguimientos_al_eliminar_investigacion();

-- Trigger para completar seguimientos
CREATE TRIGGER trigger_completar_seguimientos
  AFTER UPDATE ON investigaciones
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_seguimientos_al_completar_investigacion();

-- 5. VERIFICAR ESTRUCTURA DE LA TABLA SEGUIMIENTOS
SELECT '=== ESTRUCTURA TABLA SEGUIMIENTOS ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'seguimientos_investigacion' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. VERIFICAR TRIGGERS CORREGIDOS
SELECT '=== TRIGGERS CORREGIDOS ===' as info;

SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'seguimientos_investigacion'
AND event_object_schema = 'public';

-- 7. PROBAR ACTUALIZACIÓN DE INVESTIGACIÓN
SELECT '=== PRUEBA ACTUALIZACIÓN ===' as info;

-- Probar actualización simple para verificar que no hay errores
UPDATE investigaciones 
SET actualizado_el = NOW()
WHERE id = 'ed58dbf4-f506-4b33-a0b7-1795458a67ff'
RETURNING id, nombre, estado, actualizado_el; 