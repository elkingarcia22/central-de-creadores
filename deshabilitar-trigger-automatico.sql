-- Deshabilitar trigger que crea reclutamientos automáticamente
DROP TRIGGER IF EXISTS trigger_crear_reclutamiento_por_agendar ON investigaciones;

-- Verificar que el trigger se eliminó
SELECT 'Trigger eliminado exitosamente' as resultado; 