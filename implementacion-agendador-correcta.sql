-- ====================================
-- IMPLEMENTACIÓN CORRECTA DEL ROL AGENDADOR
-- ====================================
-- BASADO EN LA ESTRUCTURA REAL DE LA BASE DE DATOS

-- PASO 1: CREAR EL ROL AGENDADOR EN roles_plataforma
INSERT INTO roles_plataforma (id, nombre)
VALUES (
  gen_random_uuid(),
  'Agendador'
);

-- PASO 2: OBTENER EL UUID DEL ROL AGENDADOR (GUARDAR ESTE UUID)
SELECT 
  id,
  nombre
FROM roles_plataforma 
WHERE nombre = 'Agendador'
ORDER BY id DESC
LIMIT 1;

-- PASO 3: AGREGAR CAMPO responsable_agendamiento A LA TABLA reclutamientos
ALTER TABLE reclutamientos 
ADD COLUMN responsable_agendamiento UUID REFERENCES auth.users(id);

-- PASO 4: CREAR ÍNDICE PARA OPTIMIZAR CONSULTAS
CREATE INDEX IF NOT EXISTS idx_reclutamientos_responsable_agendamiento 
ON reclutamientos(responsable_agendamiento);

-- PASO 5: VERIFICAR QUE SE AGREGÓ EL CAMPO CORRECTAMENTE
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'reclutamientos' 
  AND column_name = 'responsable_agendamiento';

-- PASO 6: VERIFICAR IMPLEMENTACIÓN
SELECT 
  'Roles disponibles' as verificacion,
  COUNT(*) as cantidad
FROM roles_plataforma 
WHERE nombre = 'Agendador'

UNION ALL

SELECT 
  'Campo responsable_agendamiento creado' as verificacion,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'reclutamientos' 
        AND column_name = 'responsable_agendamiento'
    ) THEN 1 
    ELSE 0 
  END as cantidad;
