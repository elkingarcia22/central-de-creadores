import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { id } = req.query;

  console.log('🔍 Debug - ID recibido:', id);
  console.log('🔍 Debug - Tipo de ID:', typeof id);

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID de participante requerido' });
  }

  try {
    // Simular una respuesta exitosa para debug
    const debugData = {
      id: id,
      nombre: 'Participante Debug',
      email: 'debug@example.com',
      tipo: 'externo',
      comentarios: 'Comentario de debug',
      doleres_necesidades: 'Dolores de debug',
      estado_participante: 'Activo',
      total_participaciones: 5,
      fecha_ultima_participacion: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('🔍 Debug - Datos simulados:', debugData);
    
    return res.status(200).json(debugData);
  } catch (error) {
    console.error('Error en debug:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}