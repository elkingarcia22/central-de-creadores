import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      console.log('🔧 Creando usuario y asignando KAM...');

      // 1. OBTENER PRIMER USUARIO DE LA VISTA
      console.log('👥 Obteniendo primer usuario de la vista...');
      const { data: usuariosVista, error: errorVista } = await supabase
        .from('usuarios_con_roles')
        .select('id, full_name, email')
        .limit(1)
        .single();

      if (errorVista || !usuariosVista) {
        console.error('❌ Error al obtener usuario de la vista:', errorVista);
        return res.status(500).json({ error: 'Error al obtener usuario de la vista', details: errorVista });
      }

      console.log('✅ Usuario de la vista obtenido:', usuariosVista);

      // 2. CREAR USUARIO EN LA TABLA USUARIOS
      console.log('👤 Creando usuario en tabla usuarios...');
      const { data: usuarioCreado, error: errorCrear } = await supabase
        .from('usuarios')
        .insert({
          id: usuariosVista.id,
          nombre: usuariosVista.full_name,
          correo: usuariosVista.email,
          foto_url: null
        })
        .select()
        .single();

      if (errorCrear) {
        console.error('❌ Error al crear usuario:', errorCrear);
        return res.status(500).json({ error: 'Error al crear usuario', details: errorCrear });
      }

      console.log('✅ Usuario creado en tabla usuarios:', usuarioCreado);

      // 3. ASIGNAR KAM A TODAS LAS EMPRESAS
      console.log('🏢 Asignando KAM a todas las empresas...');
      const { error: errorUpdate } = await supabase
        .from('empresas')
        .update({ kam_id: usuarioCreado.id })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (errorUpdate) {
        console.error('❌ Error al actualizar empresas:', errorUpdate);
        return res.status(500).json({ error: 'Error al actualizar empresas', details: errorUpdate });
      }

      // 4. VERIFICAR RESULTADO
      console.log('📊 Verificando resultado...');
      const { data: empresasActualizadas, error: errorFinal } = await supabase
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
      const resultado = {
        usuarioCreado: usuarioCreado,
        empresasActualizadas: empresasActualizadas || [],
        resumen: {
          usuarioId: usuarioCreado.id,
          usuarioNombre: usuarioCreado.nombre,
          usuarioEmail: usuarioCreado.correo,
          totalEmpresas: empresasActualizadas?.length || 0
        }
      };

      console.log('✅ Proceso completado:', resultado.resumen);

      return res.status(200).json({
        success: true,
        message: 'Usuario creado y KAM asignado exitosamente',
        data: resultado
      });

    } catch (error) {
      console.error('❌ Error en el proceso:', error);
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