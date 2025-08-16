import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🔧 === CORRIGIENDO UUID MALFORMADO ===\n');

    // 1. Buscar libretos con UUID malformado usando consulta SQL directa
    console.log('🔍 Buscando libretos con UUID malformado...');
    const { data: libretosMalformados, error: errorBusqueda } = await supabaseServer
      .rpc('buscar_libretos_uuid_malformado');

    if (errorBusqueda) {
      console.error('❌ Error buscando libretos malformados:', errorBusqueda);
      
      // Fallback: buscar manualmente
      console.log('🔄 Intentando búsqueda manual...');
      const { data: libretos, error: errorManual } = await supabaseServer
        .from('libretos_investigacion')
        .select('id, nombre_sesion, investigacion_id, tamano_empresa_id, modalidad_id');

      if (errorManual) {
        return res.status(500).json({ error: 'Error en búsqueda manual', details: errorManual });
      }

      // Filtrar manualmente los que tienen UUID malformado
      const libretosMalformados = libretos?.filter(libreto => {
        const tamanoStr = libreto.tamano_empresa_id?.toString() || '';
        const modalidadStr = libreto.modalidad_id?.toString() || '';
        return tamanoStr.includes('34201b79-9e36-4717-8bbf-d4e572dce4b') || 
               modalidadStr.includes('34201b79-9e36-4717-8bbf-d4e572dce4b');
      }) || [];

      console.log(`📊 Encontrados ${libretosMalformados.length} libretos con UUID malformado (búsqueda manual)`);
    } else {
      console.log(`📊 Encontrados ${libretosMalformados?.length || 0} libretos con UUID malformado`);
    }

    if (!libretosMalformados || libretosMalformados.length === 0) {
      console.log('✅ No se encontraron libretos con UUID malformado');
      return res.status(200).json({ 
        message: 'No se encontraron libretos con UUID malformado',
        corregidos: 0,
        total: 0
      });
    }

    // 2. Mostrar libretos encontrados
    console.log('\n📋 Libretos con UUID malformado:');
    libretosMalformados.forEach((libreto: any, index: number) => {
      console.log(`${index + 1}. ID: ${libreto.id}`);
      console.log(`   Nombre: ${libreto.nombre_sesion}`);
      console.log(`   tamano_empresa_id: ${libreto.tamano_empresa_id}`);
      console.log(`   modalidad_id: ${libreto.modalidad_id}`);
      console.log('');
    });

    // 3. Corregir cada libreto
    console.log('🔧 Corrigiendo UUIDs malformados...');
    let corregidos = 0;
    const errores = [];

    for (const libreto of libretosMalformados) {
      try {
        const datosActualizados: any = {};

        // Corregir tamano_empresa_id si es necesario
        if (libreto.tamano_empresa_id && libreto.tamano_empresa_id.toString().includes('34201b79-9e36-4717-8bbf-d4e572dce4b')) {
          if (Array.isArray(libreto.tamano_empresa_id)) {
            // Si es un array, reemplazar el elemento malformado
            const arrayCorregido = libreto.tamano_empresa_id.map((id: any) => 
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
            const arrayCorregido = libreto.modalidad_id.map((id: any) => 
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
          const { error: errorActualizacion } = await supabaseServer
            .from('libretos_investigacion')
            .update(datosActualizados)
            .eq('id', libreto.id);

          if (errorActualizacion) {
            console.error(`❌ Error actualizando libreto ${libreto.id}:`, errorActualizacion);
            errores.push({ libreto_id: libreto.id, error: errorActualizacion });
          } else {
            console.log(`✅ Libreto ${libreto.id} corregido`);
            corregidos++;
          }
        }
      } catch (error) {
        console.error(`❌ Error procesando libreto ${libreto.id}:`, error);
        errores.push({ libreto_id: libreto.id, error: error });
      }
    }

    console.log(`\n🎯 Resumen: ${corregidos} libretos corregidos de ${libretosMalformados.length}`);

    // 4. Verificar que no queden UUIDs malformados
    console.log('\n🔍 Verificando que no queden UUIDs malformados...');
    const { data: verificacion, error: errorVerificacion } = await supabaseServer
      .from('libretos_investigacion')
      .select('id, nombre_sesion');

    let uuidMalformadosRestantes = 0;
    if (!errorVerificacion && verificacion) {
      uuidMalformadosRestantes = verificacion.filter((libreto: any) => {
        const tamanoStr = libreto.tamano_empresa_id?.toString() || '';
        const modalidadStr = libreto.modalidad_id?.toString() || '';
        return tamanoStr.includes('34201b79-9e36-4717-8bbf-d4e572dce4b') || 
               modalidadStr.includes('34201b79-9e36-4717-8bbf-d4e572dce4b');
      }).length;
    }

    console.log(`📊 UUIDs malformados restantes: ${uuidMalformadosRestantes}`);

    return res.status(200).json({
      message: 'Corrección completada',
      corregidos,
      total: libretosMalformados.length,
      errores: errores.length > 0 ? errores : undefined,
      uuid_malformados_restantes: uuidMalformadosRestantes,
      libretos_encontrados: libretosMalformados
    });

  } catch (error) {
    console.error('💥 Error general:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
