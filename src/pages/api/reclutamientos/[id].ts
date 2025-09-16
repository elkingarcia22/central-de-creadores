import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer as supabase } from '../../../api/supabase-server';
import { simpleSyncCalendar } from '../../../lib/simple-sync-calendar';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      console.log('🔍 Obteniendo reclutamiento con ID:', id);

      const { data, error } = await supabase
        .from('reclutamientos')
        .select('*')
        .eq('id', id);

      if (error) {
        console.error('Error obteniendo reclutamiento:', error);
        return res.status(500).json({ error: error.message });
      }

      if (!data || data.length === 0) {
        return res.status(404).json({ error: 'Reclutamiento no encontrado' });
      }

      console.log('✅ Reclutamiento obtenido exitosamente:', data[0]);
      return res.status(200).json(data[0]);
    } catch (error) {
      console.error('Error en la API:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  } else if (req.method === 'PUT') {
    try {
      console.log('🔄 Actualizando reclutamiento con ID:', id);
      console.log('📤 Datos recibidos:', req.body);
      console.log('🔍 Tipo de datos:', typeof req.body);
      console.log('🔍 Campos específicos:');
      console.log('  - participantes_id:', req.body.participantes_id, 'tipo:', typeof req.body.participantes_id);
      console.log('  - reclutador_id:', req.body.reclutador_id, 'tipo:', typeof req.body.reclutador_id);
      console.log('  - fecha_sesion:', req.body.fecha_sesion, 'tipo:', typeof req.body.fecha_sesion);
      console.log('  - hora_sesion:', req.body.hora_sesion, 'tipo:', typeof req.body.hora_sesion);
      console.log('  - duracion_sesion:', req.body.duracion_sesion, 'tipo:', typeof req.body.duracion_sesion);

      // Validar que los campos requeridos estén presentes - considerar diferentes tipos de participantes
      const tieneParticipante = !!(
        req.body.participantes_id || 
        req.body.participantes_internos_id || 
        req.body.participantes_friend_family_id
      );

      if (!tieneParticipante || !req.body.reclutador_id || !req.body.fecha_sesion) {
        console.error('❌ Campos requeridos faltantes:', {
          participante: tieneParticipante,
          reclutador_id: !!req.body.reclutador_id,
          fecha_sesion: !!req.body.fecha_sesion
        });
        return res.status(400).json({ 
          error: 'Campos requeridos faltantes',
          detalles: 'Se requiere al menos un campo de participante (participantes_id, participantes_internos_id, o participantes_friend_family_id), reclutador_id, y fecha_sesion'
        });
      }

      // Limpiar datos antes de enviar a Supabase
      const datosLimpios: any = {
        fecha_sesion: req.body.fecha_sesion,
        updated_at: new Date().toISOString()
      };

      // Agregar campos opcionales solo si están presentes
      if (req.body.hora_sesion !== undefined) datosLimpios.hora_sesion = req.body.hora_sesion;
      if (req.body.duracion_sesion !== undefined) datosLimpios.duracion_sesion = req.body.duracion_sesion;
      if (req.body.meet_link !== undefined) datosLimpios.meet_link = req.body.meet_link;

      // Agregar campos de participante según el tipo
      if (req.body.participantes_id) datosLimpios.participantes_id = req.body.participantes_id;
      if (req.body.participantes_internos_id) datosLimpios.participantes_internos_id = req.body.participantes_internos_id;
      if (req.body.participantes_friend_family_id) datosLimpios.participantes_friend_family_id = req.body.participantes_friend_family_id;

      // Agregar reclutador si está presente
      if (req.body.reclutador_id) datosLimpios.reclutador_id = req.body.reclutador_id;
      
      // Agregar usuarios del libreto (observadores)
      if (req.body.usuarios_libreto !== undefined) datosLimpios.usuarios_libreto = req.body.usuarios_libreto;

      console.log('🔧 Datos limpios para Supabase:', datosLimpios);

      const { data, error } = await supabase
        .from('reclutamientos')
        .update(datosLimpios)
        .eq('id', id)
        .select();

      if (error) {
        console.error('❌ Error de Supabase:', error);
        console.error('❌ Código de error:', error.code);
        console.error('❌ Mensaje de error:', error.message);
        console.error('❌ Detalles:', error.details);
        return res.status(500).json({ error: error.message });
      }

      if (!data || data.length === 0) {
        console.error('❌ No se encontró el reclutamiento después de la actualización');
        return res.status(404).json({ error: 'Reclutamiento no encontrado' });
      }

      console.log('✅ Reclutamiento actualizado exitosamente:', data[0]);

      // Sincronización automática con Google Calendar
      console.log('🔄 Iniciando sincronización automática con Google Calendar...');
      try {
        // Obtener el usuario que está actualizando el reclutamiento
        const userId = req.body.reclutador_id;
        
        if (userId) {
          const syncResult = await simpleSyncCalendar({
            userId,
            reclutamientoId: id as string,
            action: 'update'
          });
          
          if (syncResult.success) {
            console.log('✅ Sincronización automática exitosa');
          } else {
            console.log('⚠️ Sincronización automática falló:', syncResult.reason);
          }
        } else {
          console.log('⚠️ No se pudo determinar el usuario para sincronización automática');
        }
      } catch (error) {
        console.error('❌ Error en sincronización automática:', error);
        // No fallar la respuesta principal por este error
      }

      return res.status(200).json(data[0]);
    } catch (error) {
      console.error('❌ Error en la API:', error);
      console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  } else if (req.method === 'DELETE') {
    try {
      console.log('🗑️ Eliminando reclutamiento con ID:', id);

      const { data, error } = await supabase
        .from('reclutamientos')
        .delete()
        .eq('id', id)
        .select();

      if (error) {
        console.error('Error eliminando reclutamiento:', error);
        return res.status(500).json({ error: error.message });
      }

      if (!data || data.length === 0) {
        return res.status(404).json({ error: 'Reclutamiento no encontrado' });
      }

      console.log('✅ Reclutamiento eliminado exitosamente:', data[0]);

      // Sincronización automática con Google Calendar
      console.log('🔄 Iniciando sincronización automática con Google Calendar...');
      try {
        // Obtener el reclutador del reclutamiento eliminado para sincronizar
        const reclutadorId = data[0].reclutador_id;
        
        if (reclutadorId) {
          const syncResult = await simpleSyncCalendar({
            userId: reclutadorId,
            reclutamientoId: id as string,
            action: 'delete'
          });
          
          if (syncResult.success) {
            console.log('✅ Sincronización automática exitosa');
          } else {
            console.log('⚠️ Sincronización automática falló:', syncResult.reason);
          }
        } else {
          console.log('⚠️ No se pudo determinar el usuario para sincronización automática');
        }
      } catch (error) {
        console.error('❌ Error en sincronización automática:', error);
        // No fallar la respuesta principal por este error
      }

      return res.status(200).json({ message: 'Reclutamiento eliminado exitosamente', data: data[0] });
    } catch (error) {
      console.error('Error en la API:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
} 