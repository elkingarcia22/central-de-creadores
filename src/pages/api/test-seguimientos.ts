import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🧪 Test API de seguimientos - Método:', req.method);
  console.log('🧪 Query params:', req.query);
  console.log('🧪 Body:', req.body);

  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      message: 'API de seguimientos funcionando',
      method: req.method,
      query: req.query,
      timestamp: new Date().toISOString()
    });
  }

  if (req.method === 'PUT') {
    return res.status(200).json({
      success: true,
      message: 'PUT endpoint funcionando',
      method: req.method,
      query: req.query,
      body: req.body,
      timestamp: new Date().toISOString()
    });
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
