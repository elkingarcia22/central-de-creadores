-- ====================================
-- IMPLEMENTACIÓN DEL ROL AGENDADOR
-- ====================================

-- 1. INSERTAR EL ROL AGENDADOR EN roles_plataforma
INSERT INTO roles_plataforma (id, nombre, descripcion, activo, creado_el, actualizado_el)
VALUES (
  gen_random_uuid(), -- Generar UUID automáticamente
  'Agendador',
  'Rol especializado en la gestión de agendamientos de reclutamientos. Solo puede ver y editar reclutamientos donde es responsable del agendamiento.',
  true,
  NOW(),
  NOW()
);

-- 2. OBTENER EL UUID GENERADO (ejecutar después del INSERT)
-- SELECT id, nombre FROM roles_plataforma WHERE nombre = 'Agendador';

-- 3. VERIFICAR QUE EL ROL SE CREÓ CORRECTAMENTE
SELECT 
  id,
  nombre,
  descripcion,
  activo,
  creado_el
FROM roles_plataforma 
WHERE nombre = 'Agendador'
ORDER BY creado_el DESC
LIMIT 1;
