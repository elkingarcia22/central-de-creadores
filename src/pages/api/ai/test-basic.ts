import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🧪 [Test Basic] Probando endpoint básico...');

    return res.status(200).json({
      status: 'ok',
      message: 'Endpoint básico funcionando correctamente',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ [Test Basic] Error:', error);
    return res.status(500).json({ 
      error: 'Error en endpoint básico',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
