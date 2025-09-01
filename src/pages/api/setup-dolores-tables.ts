import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../api/supabase';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🔧 Configurando tablas de dolores...');

    // Leer el archivo SQL
    const sqlFilePath = path.join(process.cwd(), 'crear-tabla-dolores-participantes.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('📄 Archivo SQL leído, ejecutando...');

    // Dividir el SQL en comandos individuales
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    console.log(`🔍 Ejecutando ${commands.length} comandos SQL...`);

    // Ejecutar cada comando
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.trim()) {
        console.log(`📝 Ejecutando comando ${i + 1}/${commands.length}...`);
        
        const { error } = await supabaseServer.rpc('exec_sql', {
          sql_query: command + ';'
        });

        if (error) {
          console.error(`❌ Error en comando ${i + 1}:`, error);
          // Continuar con el siguiente comando en lugar de fallar completamente
        }
      }
    }

    // Verificar que las tablas se crearon correctamente
    console.log('🔍 Verificando creación de tablas...');

    // Verificar tabla categorias_dolores
    const { data: categorias, error: errorCategorias } = await supabaseServer
      .from('categorias_dolores')
      .select('count')
      .limit(1);

    if (errorCategorias) {
      console.error('❌ Error verificando categorias_dolores:', errorCategorias);
      return res.status(500).json({ 
        error: 'Error verificando tabla categorias_dolores',
        details: errorCategorias 
      });
    }

    // Verificar tabla dolores_participantes
    const { data: dolores, error: errorDolores } = await supabaseServer
      .from('dolores_participantes')
      .select('count')
      .limit(1);

    if (errorDolores) {
      console.error('❌ Error verificando dolores_participantes:', errorDolores);
      return res.status(500).json({ 
        error: 'Error verificando tabla dolores_participantes',
        details: errorDolores 
      });
    }

    // Obtener conteo de categorías
    const { count: totalCategorias } = await supabaseServer
      .from('categorias_dolores')
      .select('*', { count: 'exact', head: true });

    console.log('✅ Tablas de dolores configuradas exitosamente');
    console.log(`📊 Total de categorías creadas: ${totalCategorias}`);

    return res.status(200).json({
      success: true,
      message: 'Tablas de dolores configuradas exitosamente',
      totalCategorias,
      tablesCreated: ['categorias_dolores', 'dolores_participantes', 'vista_dolores_participantes']
    });

  } catch (error) {
    console.error('❌ Error configurando tablas de dolores:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
