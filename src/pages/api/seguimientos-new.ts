import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Configurar headers para JSON
  res.setHeader('Content-Type', 'application/json');
  
  console.log('🆕 [NEW API] Request recibido:', {
    method: req.method,
    url: req.url,
    query: req.query,
    body: req.body
  });

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
