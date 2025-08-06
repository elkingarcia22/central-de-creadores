import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Obtener la empresa específica que debería tener el participante "prueba 12344"
    const empresaId = "56ae11ec-f6b4-4066-9414-e51adfbebee2";
    
    const { data: empresa, error } = await supabaseServer
      .from('empresas')
      .select('id, nombre')
      .eq('id', empresaId)
      .single();

    if (error) {
      console.error('❌ Error obteniendo empresa:', error);
      return res.status(500).json({ error: 'Error obteniendo empresa', details: error.message });
    }

    console.log('🔍 Empresa obtenida:', empresa);

    return res.status(200).json({ empresa });

  } catch (error) {
    console.error('❌ Error en test-empresas:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
} 