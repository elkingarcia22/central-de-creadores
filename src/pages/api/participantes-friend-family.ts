import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      console.log('🔍 Obteniendo participantes Friend and Family');

      const { data: participantes, error } = await supabase
        .from('participantes_friend_family')
        .select(`
          id,
          nombre,
          email,
          departamento_id,
          departamentos (
            id,
            nombre,
            categoria
          )
        `)
        .order('nombre');

      if (error) {
        console.error('Error obteniendo participantes Friend and Family:', error);
        return res.status(500).json({ error: 'Error obteniendo participantes' });
      }

      // Formatear los datos para incluir información del departamento
      const participantesFormateados = participantes?.map(p => ({
        id: p.id,
        nombre: p.nombre,
        email: p.email,
        departamento_id: p.departamento_id,
        departamento: (p.departamentos as any)?.nombre || null,
        departamento_categoria: (p.departamentos as any)?.categoria || null
      })) || [];

      console.log('✅ Participantes Friend and Family obtenidos:', participantesFormateados.length);

      res.status(200).json(participantesFormateados);

    } catch (error) {
      console.error('Error obteniendo participantes Friend and Family:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  } else if (req.method === 'POST') {
    try {
      const { nombre, email, departamento_id, rol_empresa_id } = req.body;

      console.log('🔍 Creando participante Friend and Family:', { nombre, email, departamento_id, rol_empresa_id });

      // Validaciones
      if (!nombre || !email) {
        return res.status(400).json({ error: 'Nombre y email son requeridos' });
      }

      // Verificar si el email ya existe
      const { data: existingParticipant, error: checkError } = await supabase
        .from('participantes_friend_family')
        .select('id')
        .eq('email', email.toLowerCase())
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error verificando email existente:', checkError);
        return res.status(500).json({ error: 'Error verificando email existente' });
      }

      if (existingParticipant) {
        return res.status(400).json({ error: 'Ya existe un participante con este email' });
      }

      // Crear el participante
      const { data: nuevoParticipante, error: createError } = await supabase
        .from('participantes_friend_family')
        .insert({
          nombre: nombre.trim(),
          email: email.toLowerCase().trim(),
          departamento_id: departamento_id || null,
          rol_empresa_id: rol_empresa_id || null
        })
        .select(`
          id,
          nombre,
          email,
          departamento_id,
          rol_empresa_id,
          departamentos (
            id,
            nombre,
            categoria
          ),
          roles_empresa (
            id,
            nombre
          )
        `)
        .single();

      if (createError) {
        console.error('Error creando participante Friend and Family:', createError);
        return res.status(500).json({ error: 'Error creando participante' });
      }

      // Formatear la respuesta
      const participanteFormateado = {
        id: nuevoParticipante.id,
        nombre: nuevoParticipante.nombre,
        email: nuevoParticipante.email,
        departamento_id: nuevoParticipante.departamento_id,
        departamento: (nuevoParticipante.departamentos as any)?.nombre || null,
        departamento_categoria: (nuevoParticipante.departamentos as any)?.categoria || null
      };

      console.log('✅ Participante Friend and Family creado:', participanteFormateado);

      res.status(201).json(participanteFormateado);

    } catch (error) {
      console.error('Error creando participante Friend and Family:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: `Método ${req.method} no permitido` });
  }
} 