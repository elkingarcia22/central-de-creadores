-- Agregar columna hora_sesion a la tabla reclutamientos
ALTER TABLE reclutamientos 
ADD COLUMN hora_sesion TIME;

-- Comentario para explicar el propósito del campo
COMMENT ON COLUMN reclutamientos.hora_sesion IS 'Hora de la sesión en formato HH:MM'; 