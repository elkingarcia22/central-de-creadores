-- ====================================
-- BUSCAR UUID MALFORMADO
-- ====================================
-- Buscar el UUID incompleto: "34201b79-9e36-4717-8bbf-d4e572dce4b"

-- 1. Buscar en libretos_investigacion
SELECT 'libretos_investigacion' as tabla, id, nombre_sesion, tamano_empresa_id, modalidad_id
FROM libretos_investigacion 
WHERE tamano_empresa_id::text LIKE '%34201b79-9e36-4717-8bbf-d4e572dce4b%'
   OR modalidad_id::text LIKE '%34201b79-9e36-4717-8bbf-d4e572dce4b%';

-- 2. Buscar en tamanos_empresa
SELECT 'tamanos_empresa' as tabla, id, nombre
FROM tamanos_empresa 
WHERE id::text LIKE '%34201b79-9e36-4717-8bbf-d4e572dce4b%';

-- 3. Buscar en modalidades
SELECT 'modalidades' as tabla, id, nombre
FROM modalidades 
WHERE id::text LIKE '%34201b79-9e36-4717-8bbf-d4e572dce4b%';

-- 4. Buscar en cualquier tabla que tenga arrays
SELECT 'Verificando arrays en libretos' as info;
SELECT 
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
WHERE tamano_empresa_id IS NOT NULL OR modalidad_id IS NOT NULL
LIMIT 10;

-- 5. Buscar UUIDs malformados en general
SELECT 'Buscando UUIDs malformados' as info;
SELECT 
    'libretos_investigacion' as tabla,
    id,
    nombre_sesion,
    tamano_empresa_id,
    modalidad_id
FROM libretos_investigacion 
WHERE (tamano_empresa_id::text LIKE '%34201b79-9e36-4717-8bbf-d4e572dce4b%'
   OR modalidad_id::text LIKE '%34201b79-9e36-4717-8bbf-d4e572dce4b%'
   OR tamano_empresa_id::text LIKE '%34201b79-9e36-4717-8bbf-d4e572dce4b%'
   OR modalidad_id::text LIKE '%34201b79-9e36-4717-8bbf-d4e572dce4b%');
