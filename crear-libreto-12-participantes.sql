-- Crear un libreto con 12 participantes
INSERT INTO libretos_investigacion (
    nombre_sesion,
    descripcion_general,
    numero_participantes,
    numero_participantes_esperados,
    duracion_sesion,
    tipo_sesion,
    modalidad
) VALUES (
    'Sesión de prueba con 12 participantes',
    'Libreto de prueba para investigación con 12 participantes',
    12,
    12,
    60,
    'entrevista',
    'presencial'
) RETURNING id;

-- Asignar el libreto a la investigación
UPDATE investigaciones 
SET libreto = (SELECT id FROM libretos_investigacion WHERE nombre_sesion = 'Sesión de prueba con 12 participantes' ORDER BY creado_el DESC LIMIT 1)
WHERE nombre = 'prueba flujo estados (test trigger)'; 