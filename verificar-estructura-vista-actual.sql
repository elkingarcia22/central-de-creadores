-- Verificar la estructura actual de la vista
SELECT 
    view_definition 
FROM information_schema.views 
WHERE table_name = 'vista_reclutamientos_completa'; 