-- ====================================
-- OBTENER UUID DEL ROL AGENDADOR PARA ACTUALIZAR EL CÓDIGO
-- ====================================

-- 1. OBTENER EL UUID DEL ROL AGENDADOR
SELECT 
  'UUID del rol Agendador:' as descripcion,
  id as uuid,
  nombre,
  'Reemplazar en el código:' as instruccion,
  'agendador-uuid-placeholder' as placeholder_a_reemplazar
FROM roles_plataforma 
WHERE nombre = 'Agendador'
ORDER BY id DESC
LIMIT 1;

-- 2. VERIFICAR QUE EL ROL SE CREÓ CORRECTAMENTE
SELECT 
  id,
  nombre
FROM roles_plataforma 
WHERE nombre = 'Agendador';

-- 3. VERIFICAR USUARIOS CON ESTE ROL
SELECT 
  p.full_name,
  p.email,
  ur.created_at as fecha_asignacion
FROM user_roles ur
JOIN profiles p ON ur.user_id = p.id
JOIN roles_plataforma rp ON ur.role = rp.id
WHERE rp.nombre = 'Agendador'
ORDER BY ur.created_at DESC;

-- 4. INSTRUCCIONES PARA ACTUALIZAR EL CÓDIGO
-- Copiar el UUID obtenido y reemplazar en estos archivos:
-- 
-- 1. src/api/roles.ts - línea con ROLES_DEFAULT
-- 2. src/pages/configuraciones/gestion-usuarios.tsx - línea con rolesMap
--
-- Reemplazar: 'agendador-uuid-placeholder'
-- Con: 'UUID_OBTENIDO_AQUI'
