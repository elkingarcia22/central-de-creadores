import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      console.log('🔍 Verificando tabla kams...');

      // OBTENER TODOS LOS KAMS
      const { data: kams, error: errorKams } = await supabase
        .from('kams')
        .select('*')
        .order('nombre');

      if (errorKams) {
        console.error('❌ Error al obtener kams:', errorKams);
        return res.status(500).json({ 
          error: 'Error al obtener kams', 
          details: errorKams 
        });
      }

      console.log('✅ KAMs obtenidos:', kams);

      const diagnostico = {
        totalKams: kams?.length || 0,
        kams: kams || [],
        resumen: {
          hayKams: (kams && kams.length > 0),
          primerKam: kams?.[0] || null,
          ultimoKam: kams?.[kams.length - 1] || null,
          idsDisponibles: kams?.map(k => k.id) || []
        }
      };

      console.log('✅ Diagnóstico completado:', diagnostico.resumen);

      return res.status(200).json({
        success: true,
        message: 'Verificación completada exitosamente',
        data: diagnostico
      });

    } catch (error) {
      console.error('❌ Error en verificación:', error);
      return res.status(500).json({ 
        error: 'Error interno del servidor', 
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Método ${req.method} no permitido` });
  }
} 