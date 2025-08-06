import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      console.log('🔍 Verificando tabla estado_participante_cat...');

      // 1. VERIFICAR SI EXISTE LA TABLA
      console.log('📋 Verificando existencia de la tabla...');
      const { data: estados, error: errorEstados } = await supabase
        .from('estado_participante_cat')
        .select('*')
        .order('nombre');

      if (errorEstados) {
        console.error('❌ Error al obtener estados:', errorEstados);
        return res.status(500).json({ 
          error: 'Error al obtener estados de participante', 
          details: errorEstados 
        });
      }

      console.log('✅ Estados obtenidos:', estados);

      // 2. VERIFICAR ESTRUCTURA
      const estructura = estados && estados.length > 0 ? Object.keys(estados[0]) : [];
      
      const diagnostico = {
        tablaExiste: true,
        totalEstados: estados?.length || 0,
        estructura: estructura,
        estados: estados || [],
        resumen: {
          hayEstados: (estados && estados.length > 0),
          primerEstado: estados?.[0] || null,
          ultimoEstado: estados?.[estados.length - 1] || null
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