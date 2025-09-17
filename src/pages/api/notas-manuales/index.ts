import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { participante_id, sesion_id } = req.query;

      if (!participante_id || !sesion_id) {
        return res.status(400).json({ error: 'participante_id y sesion_id son requeridos' });
      }

      console.log('📝 Obteniendo notas manuales para:', { participante_id, sesion_id });

      // Verificar si es una sesión de apoyo
      const { data: sesionApoyo, error: errorApoyo } = await supabaseServer
        .from('sesiones_apoyo')
        .select('id')
        .eq('id', sesion_id)
        .single();

      let sesionIdParaBuscar = sesion_id;
      
      if (!errorApoyo && sesionApoyo) {
        // Es una sesión de apoyo, usar el ID temporal
        sesionIdParaBuscar = '00000000-0000-0000-0000-000000000001';
        console.log('🔍 Buscando notas para sesión de apoyo con ID temporal:', sesionIdParaBuscar);
      }

      const { data, error } = await supabaseServer
        .from('notas_manuales')
        .select('*')
        .eq('participante_id', participante_id)
        .eq('sesion_id', sesionIdParaBuscar)
        .order('fecha_creacion', { ascending: false });

      if (error) {
        console.error('❌ Error obteniendo notas:', error);
        return res.status(500).json({ error: 'Error al obtener notas' });
      }

      console.log('✅ Notas obtenidas:', data?.length || 0);
      return res.status(200).json({ notas: data || [] });

    } catch (error) {
      console.error('Error en API notas-manuales GET:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { participante_id, sesion_id, contenido } = req.body;

      if (!participante_id || !sesion_id || !contenido) {
        return res.status(400).json({ error: 'participante_id, sesion_id y contenido son requeridos' });
      }

      console.log('📝 Creando nueva nota manual:', { participante_id, sesion_id, contenido });

      // Verificar si es una sesión de apoyo o reclutamiento
      const { data: sesionApoyo, error: errorApoyo } = await supabaseServer
        .from('sesiones_apoyo')
        .select('id')
        .eq('id', sesion_id)
        .single();

      const { data: sesionReclutamiento, error: errorReclutamiento } = await supabaseServer
        .from('reclutamientos')
        .select('id')
        .eq('id', sesion_id)
        .single();

      console.log('🔍 Verificando tipo de sesión:', {
        esSesionApoyo: !errorApoyo && sesionApoyo,
        esSesionReclutamiento: !errorReclutamiento && sesionReclutamiento,
        sesionId: sesion_id
      });

      // Si es una sesión de apoyo, usar un ID temporal o crear una entrada en reclutamientos
      let sesionIdParaInsertar = sesion_id;
      
      if (!errorApoyo && sesionApoyo) {
        // Es una sesión de apoyo, necesitamos una solución temporal
        // Por ahora, vamos a usar un UUID fijo para sesiones de apoyo
        sesionIdParaInsertar = '00000000-0000-0000-0000-000000000001'; // UUID temporal para sesiones de apoyo
        console.log('⚠️ Usando ID temporal para sesión de apoyo:', sesionIdParaInsertar);
      }

      const { data, error } = await supabaseServer
        .from('notas_manuales')
        .insert({
          participante_id,
          sesion_id: sesionIdParaInsertar,
          contenido: contenido.trim(),
          fecha_creacion: new Date().toISOString(),
          fecha_actualizacion: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creando nota:', error);
        console.error('❌ Detalles del error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return res.status(500).json({ 
          error: 'Error al crear nota',
          details: error.message 
        });
      }

      console.log('✅ Nota creada exitosamente:', data.id);
      return res.status(201).json(data);

    } catch (error) {
      console.error('❌ Error en API notas-manuales POST:', error);
      console.error('❌ Stack trace:', error.stack);
      return res.status(500).json({ 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
