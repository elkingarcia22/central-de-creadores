import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🧪 [SIMPLE] API de seguimientos - Método:', req.method);
  console.log('🧪 [SIMPLE] URL:', req.url);
  console.log('🧪 [SIMPLE] Query:', req.query);
  console.log('🧪 [SIMPLE] Body:', req.body);

  // Configurar headers para JSON
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'PUT') {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ 
        error: 'ID requerido',
        received: req.query 
      });
    }

    return res.status(200).json({
      success: true,
      message: 'PUT funcionando correctamente',
      id: id,
      body: req.body,
      timestamp: new Date().toISOString()
    });
  }

  return res.status(405).json({ 
    error: 'Método no permitido',
    allowed: ['PUT'],
    received: req.method 
  });
}
