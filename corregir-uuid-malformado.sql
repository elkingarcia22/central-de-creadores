-- ====================================
-- CORREGIR UUID MALFORMADO
-- ====================================
-- Corregir el UUID incompleto: "34201b79-9e36-4717-8bbf-d4e572dce4b"
-- UUID correcto: "34201b79-9e36-4717-8bbf-d4e572dce4b3"

-- 1. Primero, identificar el UUID correcto en tamanos_empresa
SELECT 'Verificando UUID correcto en tamanos_empresa' as info;
SELECT id, nombre 
FROM tamanos_empresa 
WHERE id::text LIKE '34201b79-9e36-4717-8bbf-d4e572dce4b%';

-- 2. Verificar el UUID correcto en modalidades
SELECT 'Verificando UUID correcto en modalidades' as info;
SELECT id, nombre 
FROM modalidades 
WHERE id::text LIKE '34201b79-9e36-4717-8bbf-d4e572dce4b%';

-- 3. Buscar libretos con UUID malformado
SELECT 'Buscando libretos con UUID malformado' as info;
SELECT 
    id,
    nombre_sesion,
    investigacion_id,
    tamano_empresa_id,
    modalidad_id
FROM libretos_investigacion 
WHERE tamano_empresa_id::text LIKE '%34201b79-9e36-4717-8bbf-d4e572dce4b%'
   OR modalidad_id::text LIKE '%34201b79-9e36-4717-8bbf-d4e572dce4b%';

-- 4. Corregir UUID malformado en tamano_empresa_id
UPDATE libretos_investigacion 
SET tamano_empresa_id = '34201b79-9e36-4717-8bbf-d4e572dce4b3'
WHERE tamano_empresa_id::text LIKE '%34201b79-9e36-4717-8bbf-d4e572dce4b%'
  AND tamano_empresa_id::text != '34201b79-9e36-4717-8bbf-d4e572dce4b3';

-- 5. Corregir UUID malformado en modalidad_id (si es un array)
UPDATE libretos_investigacion 
SET modalidad_id = jsonb_replace(
    modalidad_id::jsonb, 
    '{0}', 
    '"34201b79-9e36-4717-8bbf-d4e572dce4b3"'
)
WHERE modalidad_id::text LIKE '%34201b79-9e36-4717-8bbf-d4e572dce4b%'
  AND modalidad_id::text NOT LIKE '%34201b79-9e36-4717-8bbf-d4e572dce4b3%';

-- 6. Corregir UUID malformado en modalidad_id (si es un valor simple)
UPDATE libretos_investigacion 
SET modalidad_id = '34201b79-9e36-4717-8bbf-d4e572dce4b3'
WHERE modalidad_id::text LIKE '%34201b79-9e36-4717-8bbf-d4e572dce4b%'
  AND modalidad_id::text != '34201b79-9e36-4717-8bbf-d4e572dce4b3'
  AND jsonb_typeof(modalidad_id) != 'array';

-- 7. Verificar la corrección
SELECT 'Verificando corrección' as info;
SELECT 
    id,
    nombre_sesion,
    investigacion_id,
    tamano_empresa_id,
    modalidad_id
FROM libretos_investigacion 
WHERE tamano_empresa_id::text LIKE '%34201b79-9e36-4717-8bbf-d4e572dce4b%'
   OR modalidad_id::text LIKE '%34201b79-9e36-4717-8bbf-d4e572dce4b%';

-- 8. Verificar que no queden UUIDs malformados
SELECT 'Verificación final - No debería haber resultados' as info;
SELECT 
    id,
    nombre_sesion,
    tamano_empresa_id,
    modalidad_id
FROM libretos_investigacion 
WHERE tamano_empresa_id::text LIKE '%34201b79-9e36-4717-8bbf-d4e572dce4b%'
   OR modalidad_id::text LIKE '%34201b79-9e36-4717-8bbf-d4e572dce4b%';
