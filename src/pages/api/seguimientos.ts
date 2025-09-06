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
      const { investigacion_id, participante_externo_id } = req.query;

      // Validar que al menos uno de los parámetros esté presente
      if (!investigacion_id && !participante_externo_id) {
        return res.status(400).json({ error: 'ID de investigación o participante externo requerido' });
      }

      if (investigacion_id && typeof investigacion_id !== 'string') {
        return res.status(400).json({ error: 'ID de investigación debe ser string' });
      }

      if (participante_externo_id && typeof participante_externo_id !== 'string') {
        return res.status(400).json({ error: 'ID de participante externo debe ser string' });
      }

      console.log('🔍 Obteniendo seguimientos:', { investigacion_id, participante_externo_id });

      // Construir la consulta basada en los parámetros disponibles
      let query = supabaseServer
        .from('seguimientos_investigacion')
        .select('*');

      if (investigacion_id) {
        query = query.eq('investigacion_id', investigacion_id);
      }

      if (participante_externo_id) {
        query = query.eq('participante_externo_id', participante_externo_id);
      }

      const { data: seguimientos, error } = await query
        .order('fecha_seguimiento', { ascending: false });

      if (error) {
        console.error('❌ Error obteniendo seguimientos:', error);
        return res.status(500).json({ 
          error: 'Error obteniendo seguimientos', 
          details: error.message 
        });
      }

      // Obtener información de participantes externos e investigaciones
      console.log('🔍 Procesando seguimientos para obtener información relacionada...');
      const seguimientosConInfo = await Promise.all(
        (seguimientos || []).map(async (seguimiento) => {
          console.log('🔍 Procesando seguimiento:', seguimiento.id);
          
          let seguimientoEnriquecido = { ...seguimiento };

          // Obtener información del participante externo si existe
          if (seguimiento.participante_externo_id) {
            try {
              console.log('🔍 Buscando participante:', seguimiento.participante_externo_id);
              const { data: participante, error: participanteError } = await supabaseServer
                .from('participantes')
                .select('id, nombre, email')
                .eq('id', seguimiento.participante_externo_id)
                .single();

              if (participanteError) {
                console.error('❌ Error obteniendo participante:', participanteError);
              } else if (participante) {
                console.log('✅ Participante encontrado:', participante);
                seguimientoEnriquecido.participante_externo = {
                  id: participante.id,
                  nombre: participante.nombre,
                  empresa_nombre: null,
                  email: participante.email
                };
              }
            } catch (error) {
              console.error('❌ Error obteniendo participante:', error);
            }
          }

          // Obtener información de la investigación si se consulta por participante externo
          if (participante_externo_id && seguimiento.investigacion_id) {
            try {
              console.log('🔍 Buscando investigación:', seguimiento.investigacion_id);
              const { data: investigacion, error: investigacionError } = await supabaseServer
                .from('investigaciones')
                .select('id, nombre')
                .eq('id', seguimiento.investigacion_id)
                .single();

              if (investigacionError) {
                console.error('❌ Error obteniendo investigación:', investigacionError);
              } else if (investigacion) {
                console.log('✅ Investigación encontrada:', investigacion);
                seguimientoEnriquecido.investigacion_nombre = investigacion.nombre;
              }
            } catch (error) {
              console.error('❌ Error obteniendo investigación:', error);
            }
          }

          // Obtener información del responsable
          if (seguimiento.responsable_id) {
            try {
              console.log('🔍 Buscando responsable:', seguimiento.responsable_id);
              const { data: responsable, error: responsableError } = await supabaseServer
                .from('profiles')
                .select('id, full_name')
                .eq('id', seguimiento.responsable_id)
                .single();

              if (responsableError) {
                console.error('❌ Error obteniendo responsable:', responsableError);
              } else if (responsable) {
                console.log('✅ Responsable encontrado:', responsable);
                seguimientoEnriquecido.responsable_nombre = responsable.full_name;
              }
            } catch (error) {
              console.error('❌ Error obteniendo responsable:', error);
            }
          }

          return seguimientoEnriquecido;
        })
      );

      const data = seguimientosConInfo;

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

  if (req.method === 'PUT') {
    // Actualizar seguimiento
    try {
      const { id } = req.query;
      const { investigacion_id, fecha_seguimiento, notas, responsable_id, estado, participante_externo_id } = req.body;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'ID de seguimiento requerido' });
      }

      console.log('🔧 Actualizando seguimiento:', id);
      console.log('📝 Datos:', { investigacion_id, fecha_seguimiento, notas, responsable_id, estado, participante_externo_id });

      const { data, error } = await supabaseServer
        .from('seguimientos_investigacion')
        .update({
          investigacion_id,
          fecha_seguimiento,
          notas,
          responsable_id,
          estado: estado || 'pendiente',
          participante_externo_id: participante_externo_id || null,
          actualizado_el: new Date().toISOString()
        })
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        console.error('❌ Error actualizando seguimiento:', error);
        return res.status(500).json({ 
          error: 'Error actualizando seguimiento', 
          details: error.message 
        });
      }

      console.log('✅ Seguimiento actualizado exitosamente:', data);

      return res.status(200).json({
        success: true,
        message: 'Seguimiento actualizado exitosamente',
        data
      });

    } catch (error) {
      console.error('❌ Error en seguimientos PUT:', error);
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
