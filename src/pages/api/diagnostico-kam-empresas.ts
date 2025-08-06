import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🔍 Iniciando diagnóstico de KAMs y empresas...');

    // 1. VERIFICAR EMPRESAS Y SUS KAMS
    console.log('📋 Verificando empresas y KAMs...');
    const { data: empresasConKams, error: errorEmpresas } = await supabase
      .from('empresas')
      .select(`
        id,
        nombre,
        kam_id,
        usuarios!empresas_kam_id_fkey (
          id,
          nombre,
          correo
        )
      `)
      .order('nombre');

    if (errorEmpresas) {
      console.error('❌ Error al obtener empresas:', errorEmpresas);
      return res.status(500).json({ error: 'Error al obtener empresas', details: errorEmpresas });
    }

    // 2. VERIFICAR EMPRESAS SIN KAM
    console.log('🔍 Verificando empresas sin KAM...');
    const empresasSinKam = empresasConKams?.filter(empresa => !empresa.kam_id) || [];

    // 3. VERIFICAR KAMS INVÁLIDOS
    console.log('🔍 Verificando KAMs inválidos...');
    const kamsInvalidos = empresasConKams?.filter(empresa => 
      empresa.kam_id && !empresa.usuarios
    ) || [];

    // 4. OBTENER PRIMER USUARIO DISPONIBLE
    console.log('👤 Obteniendo primer usuario disponible...');
    const { data: primerUsuario, error: errorUsuario } = await supabase
      .from('usuarios')
      .select('id, nombre, correo')
      .limit(1)
      .single();

    if (errorUsuario) {
      console.error('❌ Error al obtener usuario:', errorUsuario);
      return res.status(500).json({ error: 'Error al obtener usuario', details: errorUsuario });
    }

    // 5. ASIGNAR KAMS A EMPRESAS QUE NO LOS TENGAN
    let empresasActualizadas = 0;
    if (empresasSinKam.length > 0 && primerUsuario) {
      console.log(`🔄 Asignando KAM a ${empresasSinKam.length} empresas...`);
      
      const { error: errorUpdate } = await supabase
        .from('empresas')
        .update({ kam_id: primerUsuario.id })
        .in('id', empresasSinKam.map(e => e.id));

      if (errorUpdate) {
        console.error('❌ Error al actualizar empresas:', errorUpdate);
        return res.status(500).json({ error: 'Error al actualizar empresas', details: errorUpdate });
      }

      empresasActualizadas = empresasSinKam.length;
    }

    // 6. OBTENER RESULTADO FINAL
    console.log('📊 Obteniendo resultado final...');
    const { data: resultadoFinal, error: errorFinal } = await supabase
      .from('empresas')
      .select(`
        id,
        nombre,
        kam_id,
        usuarios!empresas_kam_id_fkey (
          id,
          nombre,
          correo
        )
      `)
      .order('nombre');

    if (errorFinal) {
      console.error('❌ Error al obtener resultado final:', errorFinal);
      return res.status(500).json({ error: 'Error al obtener resultado final', details: errorFinal });
    }

    // 7. PREPARAR RESPUESTA
    const diagnostico = {
      empresasConKams: empresasConKams || [],
      empresasSinKam: empresasSinKam,
      kamsInvalidos: kamsInvalidos,
      primerUsuario: primerUsuario,
      empresasActualizadas: empresasActualizadas,
      resultadoFinal: resultadoFinal || [],
      resumen: {
        totalEmpresas: empresasConKams?.length || 0,
        empresasConKam: (empresasConKams?.filter(e => e.kam_id) || []).length,
        empresasSinKam: empresasSinKam.length,
        kamsInvalidos: kamsInvalidos.length,
        empresasActualizadas: empresasActualizadas
      }
    };

    console.log('✅ Diagnóstico completado:', diagnostico.resumen);

    return res.status(200).json({
      success: true,
      message: 'Diagnóstico completado exitosamente',
      data: diagnostico
    });

  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor', 
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
} 