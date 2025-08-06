-- Verificar problema con triggers

-- 1. VERIFICAR SI EL UPDATE REALMENTE SE EJECUTÓ
SELECT 
  'VERIFICAR UPDATE' as fuente,
  r.id as reclutamiento_id,
  r.updated_at,
  r.participantes_id,
  r.investigacion_id
FROM reclutamientos r
WHERE r.id = '758813f1-512e-4566-af82-bcf0915de79c';

-- 2. VERIFICAR PERMISOS DE LA TABLA
SELECT 
  'VERIFICAR PERMISOS' as fuente,
  table_name,
  privilege_type
FROM information_schema.table_privileges 
WHERE table_name = 'historial_participacion_empresas'
AND grantee = current_user;

-- 3. VERIFICAR ESTRUCTURA DE LA TABLA
SELECT 
  'ESTRUCTURA TABLA' as fuente,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'historial_participacion_empresas'
ORDER BY ordinal_position;

-- 4. INTENTAR INSERCIÓN MANUAL
INSERT INTO historial_participacion_empresas (
    empresa_id, reclutamiento_id, investigacion_id, participante_id,
    fecha_participacion, estado_sesion, duracion_sesion,
    created_at, updated_at
) VALUES (
    '56ae11ec-f6b4-4066-9414-e51adfbebee2',
    '758813f1-512e-4566-af82-bcf0915de79c',
    '5a832297-4cca-4bad-abe6-3aad99b8b5f3',
    '9155b800-f786-46d7-9294-bb385434d042',
    NOW(),
    'completada',
    60,
    NOW(),
    NOW()
);

-- 5. VERIFICAR SI LA INSERCIÓN MANUAL FUNCIONÓ
SELECT 
  'INSERCIÓN MANUAL' as fuente,
  COUNT(*) as total_registros
FROM historial_participacion_empresas; 