import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Obtener participantes internos de la base de datos
      const { data, error } = await supabase
        .from('participantes_internos')
        .select(`
          *,
          roles_empresa:rol_empresa_id(id, nombre),
          departamentos!fk_participantes_internos_departamento(id, nombre, categoria)
        `)
        .eq('activo', true)
        .order('nombre');

      if (error) {
        console.error('Error obteniendo participantes internos:', error);
        return res.status(500).json({ error: 'Error al obtener participantes internos' });
      }

      // Formatear la respuesta
      const participantesFormateados = data?.map(p => ({
        id: p.id,
        nombre: p.nombre,
        email: p.email,
        departamento_id: p.departamento_id,
        departamento: p.departamentos?.nombre,
        departamento_categoria: p.departamentos?.categoria,
        rol_empresa_id: p.rol_empresa_id,
        roles_empresa: p.roles_empresa,
        activo: p.activo,
        fecha_ultima_participacion: p.fecha_ultima_participacion,
        total_participaciones: p.total_participaciones,
        created_at: p.created_at
      })) || [];

      res.status(200).json(participantesFormateados);
    } catch (error) {
      console.error('Error obteniendo participantes internos:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  } else if (req.method === 'POST') {
    try {
      const { nombre, email, departamentoId, rolEmpresaId } = req.body;

      // Validaciones básicas
      if (!nombre || !email) {
        return res.status(400).json({ error: 'Nombre y email son obligatorios' });
      }

      // Crear participante interno en la base de datos
      const { data: newParticipant, error } = await supabase
        .from('participantes_internos')
        .insert({
          nombre,
          email,
          departamento_id: departamentoId || null,
          rol_empresa_id: rolEmpresaId || null,
          activo: true,
          total_participaciones: 0
        })
        .select()
        .single();

      if (error) {
        console.error('Error creando participante interno:', error);
        return res.status(500).json({ error: 'Error al crear participante interno' });
      }

      res.status(201).json(newParticipant);
    } catch (error) {
      console.error('Error creando participante interno:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 