-- Verificar estructura completa de tablas relacionadas con reclutamientos

-- 1. Verificar tabla reclutamientos
SELECT 'RECLUTAMIENTOS' as tabla, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'reclutamientos'
ORDER BY ordinal_position;

-- 2. Verificar tabla investigaciones
SELECT 'INVESTIGACIONES' as tabla, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'investigaciones'
ORDER BY ordinal_position;

-- 3. Verificar tabla participantes
SELECT 'PARTICIPANTES' as tabla, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'participantes'
ORDER BY ordinal_position;

-- 4. Verificar tabla participantes_internos
SELECT 'PARTICIPANTES_INTERNOS' as tabla, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'participantes_internos'
ORDER BY ordinal_position;

-- 5. Verificar tabla participantes_friend_family
SELECT 'PARTICIPANTES_FRIEND_FAMILY' as tabla, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'participantes_friend_family'
ORDER BY ordinal_position;

-- 6. Verificar si existen registros en cada tabla
SELECT 'CONTEO_RECLUTAMIENTOS' as tabla, COUNT(*) as total FROM public.reclutamientos;
SELECT 'CONTEO_INVESTIGACIONES' as tabla, COUNT(*) as total FROM public.investigaciones;
SELECT 'CONTEO_PARTICIPANTES' as tabla, COUNT(*) as total FROM public.participantes;
SELECT 'CONTEO_PARTICIPANTES_INTERNOS' as tabla, COUNT(*) as total FROM public.participantes_internos;
SELECT 'CONTEO_PARTICIPANTES_FRIEND_FAMILY' as tabla, COUNT(*) as total FROM public.participantes_friend_family;

-- 7. Verificar relaciones entre tablas
SELECT 
  r.id,
  r.investigacion_id,
  r.participantes_id,
  r.participantes_internos_id,
  r.participantes_friend_family_id,
  r.fecha_sesion,
  r.duracion_sesion,
  r.reclutador_id
FROM public.reclutamientos r
LIMIT 3;
