import { NextApiRequest, NextApiResponse } from 'next';
import { supabase as supabaseServer } from '../../../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { id } = req.query;
  const {
    nombre,
    email,
    rol_empresa,
    empresa_nombre,
    departamento_nombre,
    estado_participante
  } = req.body;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID de participante requerido' });
  }

  if (!nombre) {
    return res.status(400).json({ error: 'Nombre es requerido' });
  }

  try {
    // Primero determinar en qué tabla está el participante
    let { data: participanteExterno } = await supabaseServer
      .from('participantes')
      .select('id')
      .eq('id', id)
      .single();

    if (participanteExterno) {
      // Es un participante externo
      const updateData: any = {
        nombre,
        updated_at: new Date().toISOString()
      };

      if (email !== undefined) updateData.email = email;

      // Si se proporciona rol_empresa, buscar el ID correspondiente
      if (rol_empresa) {
        const { data: rol } = await supabaseServer
          .from('roles_empresa')
          .select('id')
          .eq('nombre', rol_empresa)
          .single();
        if (rol) {
          updateData.rol_empresa_id = rol.id;
        }
      }

      // Si se proporciona empresa_nombre, buscar el ID correspondiente
      if (empresa_nombre) {
        const { data: empresa } = await supabaseServer
          .from('empresas')
          .select('id')
          .eq('nombre', empresa_nombre)
          .single();
        if (empresa) {
          updateData.empresa_id = empresa.id;
        }
      }

      // Si se proporciona estado_participante, buscar el ID correspondiente
      if (estado_participante) {
        const { data: estado } = await supabaseServer
          .from('estado_participante_cat')
          .select('id')
          .eq('nombre', estado_participante)
          .single();
        if (estado) {
          updateData.estado_participante = estado.id;
        }
      }

      const { data, error } = await supabaseServer
        .from('participantes')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error actualizando participante externo:', error);
        return res.status(500).json({ error: 'Error al actualizar participante' });
      }

      return res.status(200).json(data);
    }

    // Verificar si es participante interno
    let { data: participanteInterno } = await supabaseServer
      .from('participantes_internos')
      .select('id')
      .eq('id', id)
      .single();

    if (participanteInterno) {
      // Es un participante interno
      const updateData: any = {
        nombre,
        updated_at: new Date().toISOString()
      };

      if (email !== undefined) updateData.email = email;

      // Si se proporciona rol_empresa, buscar el ID correspondiente
      if (rol_empresa) {
        const { data: rol } = await supabaseServer
          .from('roles_empresa')
          .select('id')
          .eq('nombre', rol_empresa)
          .single();
        if (rol) {
          updateData.rol_empresa_id = rol.id;
        }
      }

      // Si se proporciona departamento_nombre, buscar el ID correspondiente
      if (departamento_nombre) {
        const { data: departamento } = await supabaseServer
          .from('departamentos')
          .select('id')
          .eq('nombre', departamento_nombre)
          .single();
        if (departamento) {
          updateData.departamento_id = departamento.id;
        }
      }

      const { data, error } = await supabaseServer
        .from('participantes_internos')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error actualizando participante interno:', error);
        return res.status(500).json({ error: 'Error al actualizar participante' });
      }

      return res.status(200).json(data);
    }

    // Verificar si es participante friend & family
    let { data: participanteFriendFamily } = await supabaseServer
      .from('participantes_friend_family')
      .select('id')
      .eq('id', id)
      .single();

    if (participanteFriendFamily) {
      // Es un participante friend & family
      const updateData: any = {
        nombre,
        updated_at: new Date().toISOString()
      };

      if (email !== undefined) updateData.email = email;

      // Si se proporciona rol_empresa, buscar el ID correspondiente
      if (rol_empresa) {
        const { data: rol } = await supabaseServer
          .from('roles_empresa')
          .select('id')
          .eq('nombre', rol_empresa)
          .single();
        if (rol) {
          updateData.rol_empresa_id = rol.id;
        }
      }

      // Si se proporciona departamento_nombre, buscar el ID correspondiente
      if (departamento_nombre) {
        const { data: departamento } = await supabaseServer
          .from('departamentos')
          .select('id')
          .eq('nombre', departamento_nombre)
          .single();
        if (departamento) {
          updateData.departamento_id = departamento.id;
        }
      }

      const { data, error } = await supabaseServer
        .from('participantes_friend_family')
        .update(updateData)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error actualizando participante friend & family:', error);
        return res.status(500).json({ error: 'Error al actualizar participante' });
      }

      return res.status(200).json(data);
    }

    // Si no se encuentra en ninguna tabla
    return res.status(404).json({ error: 'Participante no encontrado' });

  } catch (error) {
    console.error('Error en la API:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
