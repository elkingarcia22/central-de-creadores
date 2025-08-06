import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      console.log('🔍 Verificando foreign key de participantes.kam_id...');

      // CONSULTA SIMPLE PARA VERIFICAR LA FOREIGN KEY
      const { data: fkInfo, error: errorFK } = await supabase
        .from('information_schema.table_constraints')
        .select('*')
        .eq('table_name', 'participantes')
        .eq('constraint_type', 'FOREIGN KEY');

      if (errorFK) {
        console.error('❌ Error al obtener información de foreign key:', errorFK);
        return res.status(500).json({ error: 'Error al obtener información de foreign key', details: errorFK });
      }

      console.log('✅ Información de foreign key:', fkInfo);

      // TAMBIÉN VERIFICAR PARTICIPANTES EXISTENTES
      const { data: participantes, error: errorParticipantes } = await supabase
        .from('participantes')
        .select('id, nombre, kam_id')
        .limit(5);

      if (errorParticipantes) {
        console.error('❌ Error al obtener participantes:', errorParticipantes);
        return res.status(500).json({ error: 'Error al obtener participantes', details: errorParticipantes });
      }

      const diagnostico = {
        foreignKeyInfo: fkInfo || [],
        participantes: participantes || [],
        resumen: {
          hayFK: (fkInfo && fkInfo.length > 0),
          totalFKs: fkInfo?.length || 0,
          totalParticipantes: participantes?.length || 0,
          participantesConKam: participantes?.filter(p => p.kam_id).length || 0
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