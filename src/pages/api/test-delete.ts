import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🔍 Test DELETE llamada:', req.method, req.url);
  
  if (req.method === 'DELETE') {
    console.log('✅ DELETE method reconocido');
    return res.status(200).json({ message: 'DELETE funcionando correctamente' });
  }
  
  return res.status(405).json({ error: 'Método no permitido' });
}
