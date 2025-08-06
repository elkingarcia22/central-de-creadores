-- Verificar si hay investigaciones reales en estado pendiente
SELECT COUNT(*) as total_investigaciones FROM investigaciones;

SELECT COUNT(*) as total_pendientes FROM investigaciones WHERE estado = 'pendiente';

-- Ver todas las investigaciones y sus estados
SELECT id, nombre, estado, creado_en 
FROM investigaciones 
ORDER BY creado_en DESC;

-- Ver investigaciones en estado pendiente
SELECT id, nombre, estado, creado_en 
FROM investigaciones 
WHERE estado = 'pendiente'
ORDER BY creado_en DESC; 