-- Verificar la estructura actual de la vista
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'vista_reclutamientos_completa' 
ORDER BY ordinal_position;