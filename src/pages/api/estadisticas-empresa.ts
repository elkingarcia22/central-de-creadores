import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { empresa_id } = req.query;

      if (!empresa_id) {
        return res.status(400).json({ error: 'empresa_id es requerido' });
      }

      console.log('🔍 DEBUG: Obteniendo estadísticas de empresa:', empresa_id);

      // Datos de ejemplo más realistas
      const estadisticas = {
        total_reclutamientos: 12, // Datos de ejemplo
        total_participantes: 8,  // Datos de ejemplo
        ultima_sesion: {
          fecha: '2024-01-15',
          investigacion: 'Investigación de Usabilidad de la Plataforma'
        },
        ultima_investigacion: {
          id: 'inv-001',
          nombre: 'Investigación de Usabilidad de la Plataforma',
          descripcion: 'Estudio de usabilidad de la plataforma web'
        },
        empresa_info: { 
          id: empresa_id, 
          nombre: 'Empresa de Tecnología Avanzada',
          pais: 'Colombia',
          estado: 'Activa',
          modalidad: 'Remota',
          tamano_empresa: 'Mediana',
          industria: 'Tecnología',
          relacion: 'Cliente',
          descripcion: 'Empresa de tecnología especializada en desarrollo de software y servicios digitales'
        }
      };

      console.log('✅ DEBUG: Estadísticas de empresa obtenidas:', estadisticas);

      res.status(200).json({
        success: true,
        estadisticas
      });

    } catch (error) {
      console.error('❌ DEBUG: Error obteniendo estadísticas de empresa:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Método ${req.method} no permitido` });
  }
} 