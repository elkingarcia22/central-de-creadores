-- ====================================
-- VERIFICAR VISTA RECLUTAMIENTO ACTUAL
-- ====================================
-- Verificar la definición actual de la vista

SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views 
WHERE viewname = 'vista_reclutamientos'; 