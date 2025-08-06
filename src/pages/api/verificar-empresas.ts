import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      console.log('🔍 Verificando estructura de tabla empresas...');

      // Obtener todas las empresas con todos los campos
      const { data: empresas, error: errorEmpresas } = await supabase
        .from('empresas')
        .select('*');

      if (errorEmpresas) {
        console.error('Error obteniendo empresas:', errorEmpresas);
        return res.status(500).json({ error: 'Error al obtener empresas' });
      }

      // Verificar si existe el campo productos_relacionados
      const primeraEmpresa = empresas?.[0];
      const tieneProductosRelacionados = primeraEmpresa && 'productos_relacionados' in primeraEmpresa;

      const diagnostico = {
        totalEmpresas: empresas?.length || 0,
        estructuraPrimeraEmpresa: primeraEmpresa ? Object.keys(primeraEmpresa) : [],
        tieneProductosRelacionados,
        empresas: empresas?.map(empresa => ({
          id: empresa.id,
          nombre: empresa.nombre,
          kam_id: empresa.kam_id,
          productos_relacionados: empresa.productos_relacionados || null
        }))
      };

      res.status(200).json(diagnostico);
    } catch (error) {
      console.error('Error en GET /api/verificar-empresas:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Método ${req.method} no permitido` });
  }
} 