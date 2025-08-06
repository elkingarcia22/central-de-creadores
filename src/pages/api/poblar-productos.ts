import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      console.log('🔧 Poblando tabla productos...');

      // 1. PRODUCTOS DE EJEMPLO
      const productosEjemplo = [
        {
          nombre: 'Software de Gestión Empresarial',
          activo: true
        },
        {
          nombre: 'Plataforma de E-learning',
          activo: true
        },
        {
          nombre: 'App de Gestión de Proyectos',
          activo: true
        },
        {
          nombre: 'Sistema de CRM',
          activo: true
        },
        {
          nombre: 'Plataforma de Análisis de Datos',
          activo: true
        },
        {
          nombre: 'Software de Contabilidad',
          activo: true
        },
        {
          nombre: 'App de Recursos Humanos',
          activo: true
        },
        {
          nombre: 'Plataforma de Marketing Digital',
          activo: true
        }
      ];

      // 2. INSERTAR PRODUCTOS
      console.log('📦 Insertando productos...');
      const { data: productosInsertados, error: errorInsert } = await supabase
        .from('productos')
        .insert(productosEjemplo)
        .select();

      if (errorInsert) {
        console.error('❌ Error al insertar productos:', errorInsert);
        return res.status(500).json({ error: 'Error al insertar productos', details: errorInsert });
      }

      console.log('✅ Productos insertados:', productosInsertados);

      // 3. VERIFICAR RESULTADO
      console.log('📊 Verificando resultado...');
      const { data: productosFinales, error: errorFinal } = await supabase
        .from('productos')
        .select('*')
        .order('nombre');

      if (errorFinal) {
        console.error('❌ Error al obtener productos finales:', errorFinal);
        return res.status(500).json({ error: 'Error al obtener productos finales', details: errorFinal });
      }

      // 4. PREPARAR RESPUESTA
      const resultado = {
        productosInsertados: productosInsertados || [],
        productosFinales: productosFinales || [],
        resumen: {
          totalInsertados: productosInsertados?.length || 0,
          totalFinal: productosFinales?.length || 0,
          categorias: [...new Set(productosFinales?.map(p => p.categoria) || [])]
        }
      };

      console.log('✅ Población completada:', resultado.resumen);

      return res.status(200).json({
        success: true,
        message: 'Productos creados exitosamente',
        data: resultado
      });

    } catch (error) {
      console.error('❌ Error en el proceso:', error);
      return res.status(500).json({ 
        error: 'Error interno del servidor', 
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Método ${req.method} no permitido` });
  }
} 