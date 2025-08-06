-- Verificar todas las tablas relacionadas con reclutamiento
SELECT table_name 
FROM information_schema.tables 
WHERE table_name LIKE '%reclutamiento%' 
   OR table_name LIKE '%recruitment%'
ORDER BY table_name;

-- Verificar si existe una tabla de reclutamientos manuales
SELECT table_name 
FROM information_schema.tables 
WHERE table_name LIKE '%manual%' 
   OR table_name LIKE '%crear%'
ORDER BY table_name; 