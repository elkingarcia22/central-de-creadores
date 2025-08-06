-- Verificar libretos disponibles
SELECT 
    id,
    nombre_sesion,
    numero_participantes,
    numero_participantes_esperados,
    descripcion_general
FROM libretos_investigacion 
LIMIT 5; 