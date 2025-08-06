import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      const {
        nombre,
        email,
        rol_empresa_id,
        empresa_id,
        estado_participante,
        doleres_necesidades,
        descripción,
        kam_id,
        productos_relacionados,
        total_participaciones,
        fecha_ultima_participacion
      } = req.body;

      // Validar campos requeridos
      if (!nombre) {
        return res.status(400).json({ 
          error: 'Nombre es requerido' 
        });
      }

      // Preparar datos para actualizar
      const datosParaActualizar: any = {
        nombre,
        updated_at: new Date().toISOString()
      };

      // Solo incluir campos que están definidos
      if (email !== undefined) datosParaActualizar.email = email;
      if (rol_empresa_id !== undefined) datosParaActualizar.rol_empresa_id = rol_empresa_id;
      if (empresa_id !== undefined) datosParaActualizar.empresa_id = empresa_id;
      if (estado_participante !== undefined) datosParaActualizar.estado_participante = estado_participante;
      if (doleres_necesidades !== undefined) datosParaActualizar.doleres_necesidades = doleres_necesidades;
      if (descripción !== undefined) datosParaActualizar.descripción = descripción;
      if (kam_id !== undefined) datosParaActualizar.kam_id = kam_id;
      if (productos_relacionados !== undefined) datosParaActualizar.productos_relacionados = productos_relacionados;
      if (total_participaciones !== undefined) datosParaActualizar.total_participaciones = total_participaciones;
      if (fecha_ultima_participacion !== undefined) datosParaActualizar.fecha_ultima_participacion = fecha_ultima_participacion;

      const { data, error } = await supabase
        .from('participantes')
        .update(datosParaActualizar)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error actualizando participante:', error);
        return res.status(500).json({ 
          error: 'Error al actualizar participante',
          details: error.message 
        });
      }

      console.log('✅ Participante actualizado exitosamente:', data);
      return res.status(200).json(data);
    } catch (error) {
      console.error('Error en la API:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
} 