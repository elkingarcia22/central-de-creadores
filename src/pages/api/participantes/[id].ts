import { NextApiRequest, NextApiResponse } from 'next';
import { supabase as supabaseServer } from '../../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID de participante requerido' });
  }

  try {
    // Buscar en participantes externos
    let { data: participanteExterno, error: errorExterno } = await supabaseServer
      .from('participantes')
      .select('*')
      .eq('id', id)
      .single();

    if (participanteExterno) {
      // Obtener datos relacionados
      const { data: empresa } = await supabaseServer
        .from('empresas')
        .select('nombre')
        .eq('id', participanteExterno.empresa_id)
        .single();

      const { data: rol } = await supabaseServer
        .from('roles_empresa')
        .select('nombre')
        .eq('id', participanteExterno.rol_empresa_id)
        .single();

      const { data: estado } = await supabaseServer
        .from('estado_participante_cat')
        .select('nombre')
        .eq('id', participanteExterno.estado_participante)
        .single();

      return res.status(200).json({
        id: participanteExterno.id,
        nombre: participanteExterno.nombre,
        email: participanteExterno.email,
        tipo: 'externo',
        empresa_nombre: empresa?.nombre,
        rol_empresa: rol?.nombre,
        departamento_nombre: undefined,
        estado_participante: estado?.nombre || 'Sin estado',
        fecha_ultima_participacion: participanteExterno.fecha_ultima_participacion,
        total_participaciones: participanteExterno.total_participaciones,
        comentarios: participanteExterno.descripción,
        doleres_necesidades: participanteExterno.descripción || '',
        created_at: participanteExterno.created_at,
        updated_at: participanteExterno.updated_at
      });
    }

    // Buscar en participantes internos
    let { data: participanteInterno, error: errorInterno } = await supabaseServer
      .from('participantes_internos')
      .select('*')
      .eq('id', id)
      .single();

    if (participanteInterno) {
      // Obtener datos relacionados
      const { data: departamento } = await supabaseServer
        .from('departamentos')
        .select('nombre')
        .eq('id', participanteInterno.departamento_id)
        .single();

      const { data: rol } = await supabaseServer
        .from('roles_empresa')
        .select('nombre')
        .eq('id', participanteInterno.rol_empresa_id)
        .single();

      return res.status(200).json({
        id: participanteInterno.id,
        nombre: participanteInterno.nombre,
        email: participanteInterno.email,
        tipo: 'interno',
        empresa_nombre: undefined,
        rol_empresa: rol?.nombre,
        departamento_nombre: departamento?.nombre,
        estado_participante: 'Activo',
        fecha_ultima_participacion: participanteInterno.updated_at,
        total_participaciones: 0,
        comentarios: participanteInterno.descripción || '',
        doleres_necesidades: participanteInterno.descripción || '',
        created_at: participanteInterno.created_at,
        updated_at: participanteInterno.updated_at
      });
    }

    // Buscar en participantes friend & family
    let { data: participanteFriendFamily, error: errorFriendFamily } = await supabaseServer
      .from('participantes_friend_family')
      .select(`
        id,
        nombre,
        email,
        departamento_id,
        rol_empresa_id,
        created_at,
        updated_at,
        departamentos!inner(nombre),
        roles_empresa!inner(nombre)
      `)
      .eq('id', id)
      .single();

    if (participanteFriendFamily) {
      return res.status(200).json({
        id: participanteFriendFamily.id,
        nombre: participanteFriendFamily.nombre,
        email: participanteFriendFamily.email,
        tipo: 'friend_family',
        empresa_nombre: undefined,
        rol_empresa: participanteFriendFamily.roles_empresa?.nombre,
        departamento_nombre: participanteFriendFamily.departamentos?.nombre,
        estado_participante: 'Activo',
        fecha_ultima_participacion: participanteFriendFamily.updated_at,
        total_participaciones: 0,
        comentarios: participanteFriendFamily.descripción || '',
        doleres_necesidades: participanteFriendFamily.descripción || '',
        created_at: participanteFriendFamily.created_at,
        updated_at: participanteFriendFamily.updated_at
      });
    }

    // Si no se encuentra en ninguna tabla
    return res.status(404).json({ error: 'Participante no encontrado' });

  } catch (error) {
    console.error('Error obteniendo participante:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
} 