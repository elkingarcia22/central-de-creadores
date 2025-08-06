import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      console.log('🔧 Iniciando corrección de KAMs de empresas...');

      // 1. OBTENER USUARIOS DISPONIBLES (desde la vista usuarios_con_roles)
      console.log('👥 Obteniendo usuarios disponibles desde vista...');
      const { data: usuarios, error: errorUsuarios } = await supabase
        .from('usuarios_con_roles')
        .select('id, full_name, email')
        .order('full_name');

      if (errorUsuarios) {
        console.error('❌ Error al obtener usuarios:', errorUsuarios);
        return res.status(500).json({ error: 'Error al obtener usuarios', details: errorUsuarios });
      }

      if (!usuarios || usuarios.length === 0) {
        console.error('❌ No hay usuarios disponibles');
        return res.status(400).json({ error: 'No hay usuarios disponibles para asignar como KAM' });
      }

      // 2. OBTENER EMPRESAS ACTUALES
      console.log('🏢 Obteniendo empresas actuales...');
      const { data: empresas, error: errorEmpresas } = await supabase
        .from('empresas')
        .select('id, nombre, kam_id')
        .order('nombre');

      if (errorEmpresas) {
        console.error('❌ Error al obtener empresas:', errorEmpresas);
        return res.status(500).json({ error: 'Error al obtener empresas', details: errorEmpresas });
      }

      // 3. ASIGNAR PRIMER USUARIO COMO KAM A TODAS LAS EMPRESAS
      const primerUsuario = usuarios[0];
      console.log(`🔄 Asignando KAM ${primerUsuario.full_name} (${primerUsuario.email}) a todas las empresas...`);

      const { error: errorUpdate } = await supabase
        .from('empresas')
        .update({ kam_id: primerUsuario.id })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Actualizar todas las empresas

      if (errorUpdate) {
        console.error('❌ Error al actualizar empresas:', errorUpdate);
        return res.status(500).json({ error: 'Error al actualizar empresas', details: errorUpdate });
      }

      // 4. OBTENER RESULTADO FINAL
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

      // 5. PREPARAR RESPUESTA
      const correccion = {
        usuariosDisponibles: usuarios,
        empresasAntes: empresas || [],
        primerUsuario: primerUsuario,
        empresasActualizadas: resultadoFinal || [],
        resumen: {
          totalUsuarios: usuarios.length,
          totalEmpresas: empresas?.length || 0,
          kamAsignado: primerUsuario.full_name,
          kamEmail: primerUsuario.email
        }
      };

      console.log('✅ Corrección completada:', correccion.resumen);

      return res.status(200).json({
        success: true,
        message: 'KAMs corregidos exitosamente',
        data: correccion
      });

    } catch (error) {
      console.error('❌ Error en corrección de KAMs:', error);
      return res.status(500).json({ 
        error: 'Error interno del servidor', 
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Método ${req.method} no permitido` });
  }
} 