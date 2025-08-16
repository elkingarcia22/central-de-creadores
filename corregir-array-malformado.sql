-- ====================================
-- CORREGIR ARRAY MALFORMADO
-- ====================================
-- Corregir arrays que contienen UUIDs incompletos
-- UUID malformado: "34201b79-9e36-4717-8bbf-d4e572dce4b"
-- UUID correcto: "34201b79-9e36-4717-8bbf-d4e572dce4b3"

-- 1. Verificar el problema específico
SELECT '=== DIAGNÓSTICO DEL PROBLEMA ===' as info;

-- Verificar si hay arrays malformados
SELECT 
    'Verificando arrays malformados' as info,
    id,
    nombre_sesion,
    tamano_empresa_id,
    modalidad_id,
    CASE 
        WHEN tamano_empresa_id IS NOT NULL THEN 
            CASE 
                WHEN jsonb_typeof(tamano_empresa_id) = 'array' THEN 'ARRAY'
                ELSE 'NO ARRAY'
            END
        ELSE 'NULL'
    END as tipo_tamano_empresa,
    CASE 
        WHEN modalidad_id IS NOT NULL THEN 
            CASE 
                WHEN jsonb_typeof(modalidad_id) = 'array' THEN 'ARRAY'
                ELSE 'NO ARRAY'
            END
        ELSE 'NULL'
    END as tipo_modalidad
FROM libretos_investigacion 
WHERE tamano_empresa_id::text LIKE '%34201b79-9e36-4717-8bbf-d4e572dce4b%'
   OR modalidad_id::text LIKE '%34201b79-9e36-4717-8bbf-d4e572dce4b%';

-- 2. Corregir arrays en tamano_empresa_id
SELECT '=== CORRIGIENDO tamano_empresa_id ===' as info;

-- Si es un array, reemplazar el elemento malformado
UPDATE libretos_investigacion 
SET tamano_empresa_id = jsonb_replace(
    tamano_empresa_id::jsonb, 
    '{0}', 
    '"34201b79-9e36-4717-8bbf-d4e572dce4b3"'
)
WHERE jsonb_typeof(tamano_empresa_id) = 'array'
  AND tamano_empresa_id::text LIKE '%34201b79-9e36-4717-8bbf-d4e572dce4b%'
  AND tamano_empresa_id::text NOT LIKE '%34201b79-9e36-4717-8bbf-d4e572dce4b3%';

-- Si es un valor simple, reemplazar directamente
UPDATE libretos_investigacion 
SET tamano_empresa_id = '34201b79-9e36-4717-8bbf-d4e572dce4b3'
WHERE jsonb_typeof(tamano_empresa_id) != 'array'
  AND tamano_empresa_id::text LIKE '%34201b79-9e36-4717-8bbf-d4e572dce4b%'
  AND tamano_empresa_id::text != '34201b79-9e36-4717-8bbf-d4e572dce4b3';

-- 3. Corregir arrays en modalidad_id
SELECT '=== CORRIGIENDO modalidad_id ===' as info;

-- Si es un array, reemplazar el elemento malformado
UPDATE libretos_investigacion 
SET modalidad_id = jsonb_replace(
    modalidad_id::jsonb, 
    '{0}', 
    '"34201b79-9e36-4717-8bbf-d4e572dce4b3"'
)
WHERE jsonb_typeof(modalidad_id) = 'array'
  AND modalidad_id::text LIKE '%34201b79-9e36-4717-8bbf-d4e572dce4b%'
  AND modalidad_id::text NOT LIKE '%34201b79-9e36-4717-8bbf-d4e572dce4b3%';

-- Si es un valor simple, reemplazar directamente
UPDATE libretos_investigacion 
SET modalidad_id = '34201b79-9e36-4717-8bbf-d4e572dce4b3'
WHERE jsonb_typeof(modalidad_id) != 'array'
  AND modalidad_id::text LIKE '%34201b79-9e36-4717-8bbf-d4e572dce4b%'
  AND modalidad_id::text != '34201b79-9e36-4717-8bbf-d4e572dce4b3';

-- 4. Verificar la corrección
SELECT '=== VERIFICANDO CORRECCIÓN ===' as info;

SELECT 
    'Resultado después de corrección' as info,
    id,
    nombre_sesion,
    tamano_empresa_id,
    modalidad_id
FROM libretos_investigacion 
WHERE tamano_empresa_id::text LIKE '%34201b79-9e36-4717-8bbf-d4e572dce4b%'
   OR modalidad_id::text LIKE '%34201b79-9e36-4717-8bbf-d4e572dce4b%';

-- 5. Verificar que no queden UUIDs malformados
SELECT '=== VERIFICACIÓN FINAL ===' as info;
SELECT 
    'UUIDs malformados restantes (debería estar vacío)' as info,
    COUNT(*) as cantidad
FROM libretos_investigacion 
WHERE tamano_empresa_id::text LIKE '%34201b79-9e36-4717-8bbf-d4e572dce4b%'
   OR modalidad_id::text LIKE '%34201b79-9e36-4717-8bbf-d4e572dce4b%';

-- 6. Mostrar algunos libretos corregidos como ejemplo
SELECT '=== EJEMPLOS DE LIBRETOS CORREGIDOS ===' as info;
SELECT 
    id,
    nombre_sesion,
    investigacion_id,
    tamano_empresa_id,
    modalidad_id
FROM libretos_investigacion 
WHERE tamano_empresa_id::text LIKE '%34201b79-9e36-4717-8bbf-d4e572dce4b3%'
   OR modalidad_id::text LIKE '%34201b79-9e36-4717-8bbf-d4e572dce4b3%'
LIMIT 5;
