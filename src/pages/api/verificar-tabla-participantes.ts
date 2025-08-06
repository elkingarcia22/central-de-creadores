import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      console.log('🔍 Verificando tabla participantes...');

      // 1. VERIFICAR ESTRUCTURA DE LA TABLA
      console.log('📋 Verificando estructura de la tabla participantes...');
      const { data: participantes, error: errorParticipantes } = await supabase
        .from('participantes')
        .select('*')
        .limit(1);

      if (errorParticipantes) {
        console.error('❌ Error al obtener participantes:', errorParticipantes);
        return res.status(500).json({ 
          error: 'Error al obtener participantes', 
          details: errorParticipantes 
        });
      }

      // 2. VERIFICAR SI EXISTE TABLA KAMS
      console.log('🔍 Verificando si existe tabla kams...');
      const { data: kams, error: errorKams } = await supabase
        .from('kams')
        .select('*')
        .limit(1);

      // 3. VERIFICAR TABLA USUARIOS
      console.log('👥 Verificando tabla usuarios...');
      const { data: usuarios, error: errorUsuarios } = await supabase
        .from('usuarios')
        .select('*')
        .limit(1);

      // 4. OBTENER ESTRUCTURA
      const estructuraParticipantes = participantes && participantes.length > 0 ? Object.keys(participantes[0]) : [];
      const estructuraKams = kams && kams.length > 0 ? Object.keys(kams[0]) : [];
      const estructuraUsuarios = usuarios && usuarios.length > 0 ? Object.keys(usuarios[0]) : [];
      
      const diagnostico = {
        tablaParticipantes: {
          existe: true,
          estructura: estructuraParticipantes,
          totalColumnas: estructuraParticipantes.length,
          muestra: participantes?.[0] || null
        },
        tablaKams: {
          existe: !errorKams,
          error: errorKams,
          estructura: estructuraKams,
          totalColumnas: estructuraKams.length,
          muestra: kams?.[0] || null
        },
        tablaUsuarios: {
          existe: !errorUsuarios,
          error: errorUsuarios,
          estructura: estructuraUsuarios,
          totalColumnas: estructuraUsuarios.length,
          muestra: usuarios?.[0] || null
        },
        resumen: {
          hayParticipantes: (participantes && participantes.length > 0),
          hayKams: (kams && kams.length > 0),
          hayUsuarios: (usuarios && usuarios.length > 0),
          problema: errorKams ? 'Tabla kams no existe o no accesible' : 'Tabla kams existe'
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