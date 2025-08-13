import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { usuarioId, esAdmin, rol } = req.query;

    console.log('🔍 Obteniendo reclutamientos con filtros de asignación...');
    console.log('👤 Usuario ID:', usuarioId, 'Es Admin:', esAdmin, 'Rol:', rol);

    // Construir consulta base
    let query = supabase
      .from('reclutamientos')
      .select(`
        *,
        investigaciones (
          id,
          nombre,
          responsable_id,
          implementador_id
        ),
        participantes (
          id,
          nombre,
          email
        ),
        participantes_internos (
          id,
          nombre,
          email
        ),
        participantes_friend_family (
          id,
          nombre,
          email
        )
      `);

    // Aplicar filtros de asignación si no es administrador
    if (esAdmin !== 'true' && usuarioId) {
      console.log('🔒 Aplicando filtros de asignación para usuario:', usuarioId, 'con rol:', rol);
      
      // Para el rol agendador, filtrar por responsable_agendamiento
      if (rol === 'agendador') {
        console.log('📅 Aplicando filtro de agendador por responsable_agendamiento');
        query = query.eq('responsable_agendamiento', usuarioId);
      } else {
        // Para otros roles, filtrar por investigaciones asignadas
        console.log('🔬 Aplicando filtro por investigaciones asignadas');
        
        // Obtener investigaciones asignadas al usuario
        const { data: investigacionesAsignadas } = await supabase
          .from('investigaciones')
          .select('id')
          .or(`responsable_id.eq.${usuarioId},implementador_id.eq.${usuarioId},creado_por.eq.${usuarioId}`);

        const idsInvestigaciones = investigacionesAsignadas?.map(inv => inv.id) || [];
        
        if (idsInvestigaciones.length > 0) {
          query = query.in('investigacion_id', idsInvestigaciones);
        } else {
          // Si no tiene investigaciones asignadas, devolver array vacío
          console.log('⚠️ Usuario no tiene investigaciones asignadas');
          return res.status(200).json([]);
        }
      }
    }

    const { data: reclutamientos, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error obteniendo reclutamientos:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('✅ Reclutamientos obtenidos:', reclutamientos?.length || 0);
    return res.status(200).json(reclutamientos || []);

  } catch (error) {
    console.error('❌ Error en la API:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
