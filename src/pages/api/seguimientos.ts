import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Crear seguimiento
    try {
      const { investigacion_id, fecha_seguimiento, notas, responsable_id, estado, participante_externo_id } = req.body;

      console.log('🔧 Creando seguimiento con participante externo...');
      console.log('📝 Datos:', { investigacion_id, fecha_seguimiento, notas, responsable_id, estado, participante_externo_id });

      const { data, error } = await supabaseServer
        .from('seguimientos_investigacion')
        .insert([{
          investigacion_id,
          fecha_seguimiento,
          notas,
          responsable_id,
          estado: estado || 'pendiente',
          creado_por: responsable_id,
          participante_externo_id: participante_externo_id || null
        }])
        .select('*')
        .single();

      if (error) {
        console.error('❌ Error creando seguimiento:', error);
        return res.status(500).json({ 
          error: 'Error creando seguimiento', 
          details: error.message 
        });
      }

      console.log('✅ Seguimiento creado exitosamente:', data);

      return res.status(200).json({
        success: true,
        message: 'Seguimiento creado exitosamente',
        data
      });

    } catch (error) {
      console.error('❌ Error en seguimientos POST:', error);
      return res.status(500).json({ error: 'Error interno del servidor', details: error.message });
    }
  }

  if (req.method === 'GET') {
    // Obtener seguimientos
    try {
      const { investigacion_id } = req.query;

      if (!investigacion_id || typeof investigacion_id !== 'string') {
        return res.status(400).json({ error: 'ID de investigación requerido' });
      }

      console.log('🔍 Obteniendo seguimientos para investigación:', investigacion_id);

      const { data: seguimientos, error } = await supabaseServer
        .from('seguimientos_investigacion')
        .select('*')
        .eq('investigacion_id', investigacion_id)
        .order('fecha_seguimiento', { ascending: false });

      if (error) {
        console.error('❌ Error obteniendo seguimientos:', error);
        return res.status(500).json({ 
          error: 'Error obteniendo seguimientos', 
          details: error.message 
        });
      }

      // Obtener información de participantes externos si existen
      console.log('🔍 Procesando seguimientos para obtener participantes...');
      const seguimientosConParticipantes = await Promise.all(
        (seguimientos || []).map(async (seguimiento) => {
          console.log('🔍 Procesando seguimiento:', seguimiento.id, 'participante_externo_id:', seguimiento.participante_externo_id);
          if (seguimiento.participante_externo_id) {
            try {
              console.log('🔍 Buscando participante:', seguimiento.participante_externo_id);
              // Consultar directamente la tabla participantes con las columnas correctas
              const { data: participante, error: participanteError } = await supabaseServer
                .from('participantes')
                .select('id, nombre, email')
                .eq('id', seguimiento.participante_externo_id)
                .single();

              if (participanteError) {
                console.error('❌ Error obteniendo participante:', participanteError);
              } else if (participante) {
                console.log('✅ Participante encontrado:', participante);
                return {
                  ...seguimiento,
                  participante_externo: {
                    id: participante.id,
                    nombre: participante.nombre,
                    empresa_nombre: null, // No disponible en la consulta directa
                    email: participante.email
                  }
                };
              } else {
                console.log('⚠️ Participante no encontrado');
              }
            } catch (error) {
              console.error('❌ Error obteniendo participante:', error);
            }
          }
          return seguimiento;
        })
      );

      const data = seguimientosConParticipantes;

      console.log('✅ Seguimientos obtenidos:', data?.length || 0);

      return res.status(200).json({
        success: true,
        data: data || []
      });

    } catch (error) {
      console.error('❌ Error en seguimientos GET:', error);
      return res.status(500).json({ error: 'Error interno del servidor', details: error.message });
    }
  }

  if (req.method === 'DELETE') {
    // Eliminar seguimiento
    try {
      const { id } = req.query;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'ID de seguimiento requerido' });
      }

      console.log('🗑️ Eliminando seguimiento:', id);

      const { error } = await supabaseServer
        .from('seguimientos_investigacion')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error eliminando seguimiento:', error);
        return res.status(500).json({ 
          error: 'Error eliminando seguimiento', 
          details: error.message 
        });
      }

      console.log('✅ Seguimiento eliminado exitosamente');

      return res.status(200).json({
        success: true,
        message: 'Seguimiento eliminado exitosamente'
      });

    } catch (error) {
      console.error('❌ Error en seguimientos DELETE:', error);
      return res.status(500).json({ error: 'Error interno del servidor', details: error.message });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
