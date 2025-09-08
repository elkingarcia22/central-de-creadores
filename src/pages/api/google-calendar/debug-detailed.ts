import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer as supabase } from '../../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'ID de usuario requerido' });
    }

    console.log('🔍 DEBUG: Iniciando debug detallado para usuario:', userId);

    // 1. Verificar tokens
    const { data: tokens, error: tokensError } = await supabase
      .from('google_calendar_tokens')
      .select('*')
      .eq('user_id', userId)
      .single();

    console.log('🔍 DEBUG: Tokens:', tokens ? 'Encontrados' : 'No encontrados', tokensError?.message);

    // 2. Buscar reclutamientos como reclutador
    const { data: reclutamientosReclutador, error: errorReclutador } = await supabase
      .from('reclutamientos')
      .select('*')
      .eq('reclutador_id', userId);

    console.log('🔍 DEBUG: Reclutamientos como reclutador:', reclutamientosReclutador?.length || 0, errorReclutador?.message);

    // 3. Buscar investigaciones como responsable
    const { data: investigacionesResponsable, error: errorResponsable } = await supabase
      .from('investigaciones')
      .select('id')
      .eq('responsable_id', userId);

    console.log('🔍 DEBUG: Investigaciones como responsable:', investigacionesResponsable?.length || 0, errorResponsable?.message);

    // 4. Buscar investigaciones como implementador
    const { data: investigacionesImplementador, error: errorImplementador } = await supabase
      .from('investigaciones')
      .select('id')
      .eq('implementador_id', userId);

    console.log('🔍 DEBUG: Investigaciones como implementador:', investigacionesImplementador?.length || 0, errorImplementador?.message);

    // 5. Buscar reclutamientos de investigaciones donde es responsable
    let reclutamientosResponsable = [];
    if (investigacionesResponsable && investigacionesResponsable.length > 0) {
      const investigacionIds = investigacionesResponsable.map(i => i.id);
      const { data: reclutamientosResp, error: errorResp } = await supabase
        .from('reclutamientos')
        .select('*')
        .in('investigacion_id', investigacionIds);
      
      reclutamientosResponsable = reclutamientosResp || [];
      console.log('🔍 DEBUG: Reclutamientos como responsable:', reclutamientosResponsable.length, errorResp?.message);
    }

    // 6. Buscar reclutamientos de investigaciones donde es implementador
    let reclutamientosImplementador = [];
    if (investigacionesImplementador && investigacionesImplementador.length > 0) {
      const investigacionIds = investigacionesImplementador.map(i => i.id);
      const { data: reclutamientosImpl, error: errorImpl } = await supabase
        .from('reclutamientos')
        .select('*')
        .in('investigacion_id', investigacionIds);
      
      reclutamientosImplementador = reclutamientosImpl || [];
      console.log('🔍 DEBUG: Reclutamientos como implementador:', reclutamientosImplementador.length, errorImpl?.message);
    }

    // 7. Combinar todos los reclutamientos
    const allReclutamientos = [
      ...(reclutamientosReclutador || []),
      ...reclutamientosResponsable,
      ...reclutamientosImplementador
    ];

    // Eliminar duplicados
    const uniqueReclutamientos = allReclutamientos.filter((reclutamiento, index, self) => 
      index === self.findIndex(r => r.id === reclutamiento.id)
    );

    console.log('🔍 DEBUG: Total reclutamientos únicos:', uniqueReclutamientos.length);

    return res.status(200).json({
      success: true,
      debug: {
        tokens: tokens ? 'Encontrados' : 'No encontrados',
        tokens_error: tokensError?.message,
        reclutamientos_reclutador: reclutamientosReclutador?.length || 0,
        reclutamientos_reclutador_error: errorReclutador?.message,
        investigaciones_responsable: investigacionesResponsable?.length || 0,
        investigaciones_responsable_error: errorResponsable?.message,
        investigaciones_implementador: investigacionesImplementador?.length || 0,
        investigaciones_implementador_error: errorImplementador?.message,
        reclutamientos_responsable: reclutamientosResponsable.length,
        reclutamientos_implementador: reclutamientosImplementador.length,
        total_reclutamientos: uniqueReclutamientos.length,
        sample_reclutamientos: uniqueReclutamientos.slice(0, 3).map(r => ({
          id: r.id,
          fecha_sesion: r.fecha_sesion,
          hora_sesion: r.hora_sesion,
          meet_link: r.meet_link
        }))
      }
    });

  } catch (error) {
    console.error('❌ Error en debug detallado:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
