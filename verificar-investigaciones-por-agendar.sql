-- Verificar investigaciones en estado "por agendar"
SELECT COUNT(*) as total_por_agendar FROM investigaciones WHERE estado = 'por_agendar';

-- Ver todas las investigaciones y sus estados
SELECT id, nombre, estado, creado_en 
FROM investigaciones 
ORDER BY creado_en DESC;

-- Ver investigaciones que podrían estar en estado por agendar
SELECT id, nombre, estado, creado_en 
FROM investigaciones 
WHERE estado ILIKE '%agendar%' OR estado ILIKE '%pendiente%'
ORDER BY creado_en DESC; 