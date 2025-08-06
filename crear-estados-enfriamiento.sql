-- Agregar estados de enfriamiento a la tabla estado_participante_cat
-- Primero verificar si ya existen
SELECT * FROM estado_participante_cat WHERE nombre IN ('Disponible', 'Enfriamiento');

-- Insertar estados si no existen
INSERT INTO estado_participante_cat (nombre, activo)
SELECT 'Disponible', true
WHERE NOT EXISTS (SELECT 1 FROM estado_participante_cat WHERE nombre = 'Disponible');

INSERT INTO estado_participante_cat (nombre, activo)
SELECT 'Enfriamiento', true
WHERE NOT EXISTS (SELECT 1 FROM estado_participante_cat WHERE nombre = 'Enfriamiento');

-- Verificar los estados finales
SELECT * FROM estado_participante_cat ORDER BY nombre; 