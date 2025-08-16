// Script para corregir UUID malformado en la base de datos
const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tu-proyecto.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'tu-service-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function corregirUUIDMalformado() {
  console.log('🔧 === CORRIGIENDO UUID MALFORMADO ===\n');

  try {
    // 1. Buscar libretos con UUID malformado
    console.log('🔍 Buscando libretos con UUID malformado...');
    const { data: libretosMalformados, error: errorBusqueda } = await supabase
      .from('libretos_investigacion')
      .select('id, nombre_sesion, investigacion_id, tamano_empresa_id, modalidad_id')
      .or('tamano_empresa_id.like.%34201b79-9e36-4717-8bbf-d4e572dce4b%,modalidad_id.like.%34201b79-9e36-4717-8bbf-d4e572dce4b%');

    if (errorBusqueda) {
      console.error('❌ Error buscando libretos malformados:', errorBusqueda);
      return;
    }

    console.log(`📊 Encontrados ${libretosMalformados?.length || 0} libretos con UUID malformado`);

    if (!libretosMalformados || libretosMalformados.length === 0) {
      console.log('✅ No se encontraron libretos con UUID malformado');
      return;
    }

    // 2. Mostrar libretos encontrados
    console.log('\n📋 Libretos con UUID malformado:');
    libretosMalformados.forEach((libreto, index) => {
      console.log(`${index + 1}. ID: ${libreto.id}`);
      console.log(`   Nombre: ${libreto.nombre_sesion}`);
      console.log(`   tamano_empresa_id: ${libreto.tamano_empresa_id}`);
      console.log(`   modalidad_id: ${libreto.modalidad_id}`);
      console.log('');
    });

    // 3. Corregir cada libreto
    console.log('🔧 Corrigiendo UUIDs malformados...');
    let corregidos = 0;

    for (const libreto of libretosMalformados) {
      try {
        const datosActualizados = {};

        // Corregir tamano_empresa_id si es necesario
        if (libreto.tamano_empresa_id && libreto.tamano_empresa_id.toString().includes('34201b79-9e36-4717-8bbf-d4e572dce4b')) {
          if (Array.isArray(libreto.tamano_empresa_id)) {
            // Si es un array, reemplazar el elemento malformado
            const arrayCorregido = libreto.tamano_empresa_id.map(id => 
              id.toString().includes('34201b79-9e36-4717-8bbf-d4e572dce4b') && !id.toString().includes('34201b79-9e36-4717-8bbf-d4e572dce4b3') 
                ? '34201b79-9e36-4717-8bbf-d4e572dce4b3' 
                : id
            );
            datosActualizados.tamano_empresa_id = arrayCorregido;
          } else {
            // Si es un valor simple
            datosActualizados.tamano_empresa_id = '34201b79-9e36-4717-8bbf-d4e572dce4b3';
          }
        }

        // Corregir modalidad_id si es necesario
        if (libreto.modalidad_id && libreto.modalidad_id.toString().includes('34201b79-9e36-4717-8bbf-d4e572dce4b')) {
          if (Array.isArray(libreto.modalidad_id)) {
            // Si es un array, reemplazar el elemento malformado
            const arrayCorregido = libreto.modalidad_id.map(id => 
              id.toString().includes('34201b79-9e36-4717-8bbf-d4e572dce4b') && !id.toString().includes('34201b79-9e36-4717-8bbf-d4e572dce4b3') 
                ? '34201b79-9e36-4717-8bbf-d4e572dce4b3' 
                : id
            );
            datosActualizados.modalidad_id = arrayCorregido;
          } else {
            // Si es un valor simple
            datosActualizados.modalidad_id = '34201b79-9e36-4717-8bbf-d4e572dce4b3';
          }
        }

        // Actualizar el libreto si hay cambios
        if (Object.keys(datosActualizados).length > 0) {
          const { error: errorActualizacion } = await supabase
            .from('libretos_investigacion')
            .update(datosActualizados)
            .eq('id', libreto.id);

          if (errorActualizacion) {
            console.error(`❌ Error actualizando libreto ${libreto.id}:`, errorActualizacion);
          } else {
            console.log(`✅ Libreto ${libreto.id} corregido`);
            corregidos++;
          }
        }
      } catch (error) {
        console.error(`❌ Error procesando libreto ${libreto.id}:`, error);
      }
    }

    console.log(`\n🎯 Resumen: ${corregidos} libretos corregidos de ${libretosMalformados.length}`);

    // 4. Verificar que no queden UUIDs malformados
    console.log('\n🔍 Verificando que no queden UUIDs malformados...');
    const { data: verificacion, error: errorVerificacion } = await supabase
      .from('libretos_investigacion')
      .select('id, nombre_sesion')
      .or('tamano_empresa_id.like.%34201b79-9e36-4717-8bbf-d4e572dce4b%,modalidad_id.like.%34201b79-9e36-4717-8bbf-d4e572dce4b%');

    if (errorVerificacion) {
      console.error('❌ Error en verificación:', errorVerificacion);
    } else {
      console.log(`📊 UUIDs malformados restantes: ${verificacion?.length || 0}`);
      if (verificacion && verificacion.length > 0) {
        console.log('⚠️ Aún quedan UUIDs malformados:');
        verificacion.forEach(libreto => {
          console.log(`   - ${libreto.id}: ${libreto.nombre_sesion}`);
        });
      } else {
        console.log('✅ Todos los UUIDs malformados han sido corregidos');
      }
    }

  } catch (error) {
    console.error('💥 Error general:', error);
  }
}

// Ejecutar la corrección
corregirUUIDMalformado();
