-- Verificar libretos con 12 participantes
SELECT 
    id,
    nombre_sesion,
    numero_participantes,
    descripcion_general
FROM libretos_investigacion 
WHERE numero_participantes = 12; 