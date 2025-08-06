-- Cambiar el estado de la investigación "objetivos - Copia - Copia" a deprecado
UPDATE investigaciones 
SET estado = 'deprecado'::enum_estado_investigacion
WHERE nombre = 'objetivos - Copia - Copia';

-- Verificar el cambio
SELECT 
    id,
    nombre,
    estado,
    creado_el
FROM investigaciones 
WHERE nombre = 'objetivos - Copia - Copia'; 