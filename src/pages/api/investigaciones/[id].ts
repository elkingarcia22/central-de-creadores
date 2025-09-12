import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID de investigación requerido' });
  }

  try {
    console.log('🔍 Obteniendo investigación:', id);
    console.log('🔍 supabaseServer disponible:', !!supabaseServer);

    if (!supabaseServer) {
      console.error('❌ supabaseServer no está disponible');
      return res.status(500).json({ error: 'Error de configuración del servidor' });
    }

    // Buscar la investigación por ID
    const { data: investigacion, error: errorInvestigacion } = await supabaseServer
      .from('investigaciones')
      .select(`
        id,
        nombre,
        descripcion,
        estado,
        fecha_inicio,
        fecha_fin,
        tipo_sesion,
        riesgo_automatico,
        responsable_id,
        creado_por,
        fecha_creacion,
        fecha_actualizacion
      `)
      .eq('id', id)
      .single();

    if (errorInvestigacion) {
      console.error('❌ Error obteniendo investigación:', errorInvestigacion);
      return res.status(500).json({ error: 'Error obteniendo investigación' });
    }

    if (!investigacion) {
      console.log('⚠️ Investigación no encontrada:', id);
      return res.status(404).json({ error: 'Investigación no encontrada' });
    }

    console.log('✅ Investigación encontrada:', investigacion);

    // Si hay responsable_id, obtener información del responsable
    if (investigacion.responsable_id) {
      try {
        const { data: responsable, error: errorResponsable } = await supabaseServer
          .from('usuarios_con_roles')
          .select('id, full_name, email')
          .eq('id', investigacion.responsable_id)
          .single();

        if (responsable && !errorResponsable) {
          console.log('✅ Responsable encontrado:', responsable);
          investigacion.responsable = responsable;
        } else {
          console.log('⚠️ No se pudo obtener información del responsable:', errorResponsable);
        }
      } catch (error) {
        console.log('⚠️ Error obteniendo responsable:', error);
      }
    }

    return res.status(200).json(investigacion);

  } catch (error) {
    console.error('❌ Error en endpoint investigación:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
