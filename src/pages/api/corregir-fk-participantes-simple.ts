import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      console.log('🔧 Corrigiendo foreign key de tabla participantes (método simple)...');

      // 1. VERIFICAR ESTADO ACTUAL
      console.log('📋 Verificando estado actual...');
      const { data: participantesActuales, error: errorParticipantes } = await supabase
        .from('participantes')
        .select('id, nombre, kam_id')
        .limit(3);

      if (errorParticipantes) {
        console.error('❌ Error al obtener participantes:', errorParticipantes);
        return res.status(500).json({ error: 'Error al obtener participantes', details: errorParticipantes });
      }

      console.log('✅ Participantes actuales:', participantesActuales);

      // 2. INTENTAR INSERTAR UN PARTICIPANTE CON UN KAM_ID VÁLIDO DE USUARIOS
      console.log('🧪 Probando inserción con KAM válido...');
      
      // Obtener un usuario válido
      const { data: usuarios, error: errorUsuarios } = await supabase
        .from('usuarios')
        .select('id, nombre, correo')
        .limit(1);

      if (errorUsuarios || !usuarios || usuarios.length === 0) {
        console.error('❌ Error al obtener usuarios:', errorUsuarios);
        return res.status(500).json({ error: 'Error al obtener usuarios', details: errorUsuarios });
      }

      const usuarioValido = usuarios[0];
      console.log('✅ Usuario válido encontrado:', usuarioValido);

      // Intentar insertar un participante de prueba
      const { data: participantePrueba, error: errorInsert } = await supabase
        .from('participantes')
        .insert({
          nombre: 'Participante Prueba FK',
          rol_empresa_id: '020ba112-9f57-4dc3-b70f-c9a774dbe81b', // Usar un rol válido
          kam_id: usuarioValido.id,
          empresa_id: 'e3fe8e55-b69f-4fa8-9fbd-559af8457931', // Usar una empresa válida
          estado_participante: 'aecbab89-9fae-4932-a378-35ce5ff078aa' // Estado válido
        })
        .select()
        .single();

      if (errorInsert) {
        console.error('❌ Error al insertar participante de prueba:', errorInsert);
        return res.status(500).json({ 
          error: 'Error al insertar participante de prueba', 
          details: errorInsert,
          mensaje: 'La foreign key aún apunta a la tabla kams, necesitas ejecutar el script SQL manualmente'
        });
      }

      console.log('✅ Participante de prueba insertado exitosamente:', participantePrueba);

      // 3. LIMPIAR EL PARTICIPANTE DE PRUEBA
      const { error: errorDelete } = await supabase
        .from('participantes')
        .delete()
        .eq('id', participantePrueba.id);

      if (errorDelete) {
        console.warn('⚠️ No se pudo eliminar el participante de prueba:', errorDelete);
      } else {
        console.log('✅ Participante de prueba eliminado');
      }

      const resultado = {
        participantePrueba: participantePrueba,
        usuarioUsado: usuarioValido,
        resumen: {
          pruebaExitosa: true,
          mensaje: 'La foreign key ya está corregida o el participante se insertó exitosamente'
        }
      };

      console.log('✅ Prueba completada:', resultado.resumen);

      return res.status(200).json({
        success: true,
        message: 'Prueba de foreign key completada',
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