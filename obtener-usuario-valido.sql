-- Obtener un usuario válido para testing
SELECT 
  id,
  nombre,
  'Usuario válido para testing' as descripcion
FROM public.usuarios 
LIMIT 5;
