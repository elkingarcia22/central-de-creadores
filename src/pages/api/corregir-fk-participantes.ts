import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      console.log('🔧 Corrigiendo foreign key de tabla participantes...');

      // 1. VERIFICAR ESTADO ACTUAL
      console.log('📋 Verificando estado actual de la tabla participantes...');
      const { data: participantesActuales, error: errorParticipantes } = await supabase
        .from('participantes')
        .select('id, nombre, kam_id')
        .limit(5);

      if (errorParticipantes) {
        console.error('❌ Error al obtener participantes:', errorParticipantes);
        return res.status(500).json({ error: 'Error al obtener participantes', details: errorParticipantes });
      }

      console.log('✅ Participantes actuales:', participantesActuales);

      // 2. EJECUTAR SQL PARA CORREGIR LA FOREIGN KEY
      console.log('🔧 Ejecutando corrección de foreign key...');
      
      // Primero eliminar la foreign key existente
      const { error: errorDropFK } = await supabase.rpc('exec_sql', {
        sql_query: `
          ALTER TABLE participantes 
          DROP CONSTRAINT IF EXISTS participantes_kam_id_fkey;
        `
      });

      if (errorDropFK) {
        console.error('❌ Error eliminando foreign key:', errorDropFK);
        return res.status(500).json({ error: 'Error eliminando foreign key', details: errorDropFK });
      }

      // Luego crear la nueva foreign key que apunte a usuarios
      const { error: errorAddFK } = await supabase.rpc('exec_sql', {
        sql_query: `
          ALTER TABLE participantes 
          ADD CONSTRAINT participantes_kam_id_fkey 
          FOREIGN KEY (kam_id) REFERENCES usuarios(id);
        `
      });

      if (errorAddFK) {
        console.error('❌ Error creando nueva foreign key:', errorAddFK);
        return res.status(500).json({ error: 'Error creando nueva foreign key', details: errorAddFK });
      }

      console.log('✅ Foreign key corregida exitosamente');

      // 3. VERIFICAR RESULTADO
      console.log('📊 Verificando resultado...');
      const { data: participantesFinales, error: errorFinal } = await supabase
        .from('participantes')
        .select('id, nombre, kam_id')
        .limit(5);

      if (errorFinal) {
        console.error('❌ Error al verificar resultado:', errorFinal);
        return res.status(500).json({ error: 'Error al verificar resultado', details: errorFinal });
      }

      const resultado = {
        participantesAntes: participantesActuales,
        participantesDespues: participantesFinales,
        resumen: {
          totalAntes: participantesActuales?.length || 0,
          totalDespues: participantesFinales?.length || 0,
          correccionExitosa: true
        }
      };

      console.log('✅ Corrección completada:', resultado.resumen);

      return res.status(200).json({
        success: true,
        message: 'Foreign key corregida exitosamente',
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