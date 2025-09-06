import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID de sesión requerido' });
  }

  try {
    switch (req.method) {
      case 'POST':
        return await handleSync(req, res, id);
      case 'DELETE':
        return await handleUnsync(req, res, id);
      default:
        res.setHeader('Allow', ['POST', 'DELETE']);
        return res.status(405).json({ error: 'Método no permitido' });
    }
  } catch (error) {
    console.error('Error en API google-sync:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function handleSync(req: NextApiRequest, res: NextApiResponse, sesionId: string) {
  const { google_event_id, google_calendar_id } = req.body;

  if (!google_event_id) {
    return res.status(400).json({ error: 'google_event_id es requerido' });
  }

  try {
    // Actualizar sesión con información de Google Calendar
    const { data, error } = await supabase
      .from('sesiones')
      .update({
        google_event_id: google_event_id,
        google_calendar_id: google_calendar_id || 'primary',
        updated_at: new Date().toISOString()
      })
      .eq('id', sesionId)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando sesión:', error);
      return res.status(500).json({ error: 'Error actualizando sesión' });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error en sync:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function handleUnsync(req: NextApiRequest, res: NextApiResponse, sesionId: string) {
  try {
    // Remover información de Google Calendar de la sesión
    const { data, error } = await supabase
      .from('sesiones')
      .update({
        google_event_id: null,
        google_calendar_id: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', sesionId)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando sesión:', error);
      return res.status(500).json({ error: 'Error actualizando sesión' });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error en unsync:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
