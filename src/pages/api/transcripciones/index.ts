import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('📝 API transcripciones llamada:', req.method, req.body);
  
  if (req.method === 'POST') {
    try {
      const { reclutamiento_id, sesion_apoyo_id, meet_link, estado, fecha_inicio, semaforo_riesgo = 'verde' } = req.body;
      
      console.log('📝 Datos recibidos:', { reclutamiento_id, sesion_apoyo_id, meet_link, estado, fecha_inicio, semaforo_riesgo });

      // Validar datos requeridos - debe tener al menos uno de los dos IDs
      if (!reclutamiento_id && !sesion_apoyo_id) {
        console.log('❌ Error: reclutamiento_id o sesion_apoyo_id es requerido');
        return res.status(400).json({ error: 'reclutamiento_id o sesion_apoyo_id es requerido' });
      }

      // Validar semaforo_riesgo
      if (!['verde', 'amarillo', 'rojo'].includes(semaforo_riesgo)) {
        return res.status(400).json({ error: 'semaforo_riesgo debe ser verde, amarillo o rojo' });
      }

      // Crear nueva transcripción
      const insertData: any = {
        meet_link: meet_link || '',
        estado: estado || 'procesando',
        fecha_inicio: fecha_inicio || new Date().toISOString(),
        idioma_detectado: 'es',
        transcripcion_por_segmentos: [],
        semaforo_riesgo
      };

      // Agregar el ID correspondiente según el tipo de sesión
      if (reclutamiento_id) {
        insertData.reclutamiento_id = reclutamiento_id;
      } else if (sesion_apoyo_id) {
        // Para sesiones de apoyo, no usamos reclutamiento_id (NULL)
        insertData.reclutamiento_id = null;
        insertData.sesion_apoyo_id = sesion_apoyo_id;
      }

      const { data, error } = await supabase
        .from('transcripciones_sesiones')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creando transcripción:', error);
        return res.status(500).json({ error: 'Error al crear transcripción', details: error.message });
      }

      console.log('✅ Transcripción creada:', data.id);
      return res.status(201).json(data);

    } catch (error) {
      console.error('Error en API transcripciones:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  if (req.method === 'GET') {
    try {
      const { reclutamiento_id, sesion_apoyo_id } = req.query;

      let query = supabase
        .from('transcripciones_sesiones')
        .select('*')
        .order('created_at', { ascending: false });

      if (reclutamiento_id) {
        query = query.eq('reclutamiento_id', reclutamiento_id);
      } else if (sesion_apoyo_id) {
        // Para sesiones de apoyo, buscar por sesion_apoyo_id
        query = query.eq('sesion_apoyo_id', sesion_apoyo_id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error obteniendo transcripciones:', error);
        return res.status(500).json({ error: 'Error al obtener transcripciones' });
      }

      return res.status(200).json(data);

    } catch (error) {
      console.error('Error en API transcripciones GET:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
