import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      console.log('🔄 GET /api/test-supabase - Iniciando prueba...');
      
      // Prueba 1: Verificar conexión básica
      console.log('📡 Probando conexión básica...');
      const { data: testData, error: testError } = await supabase
        .from('empresas')
        .select('count')
        .limit(1);

      console.log('📊 Prueba básica:', { testData, testError });

      // Prueba 2: Verificar si hay datos
      console.log('📡 Probando consulta de datos...');
      const { data, error } = await supabase
        .from('empresas')
        .select('id, nombre')
        .order('nombre');

      console.log('📊 Prueba de datos:', { 
        data: data?.length || 0, 
        error: error ? error.message : null,
        hasData: !!data,
        dataType: typeof data,
        isArray: Array.isArray(data),
        firstRecord: data?.[0]
      });

      // Prueba 3: Verificar configuración de Supabase
      console.log('📡 Verificando configuración...');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      console.log('🔧 Configuración:', {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
        urlLength: supabaseUrl?.length || 0,
        keyLength: supabaseKey?.length || 0
      });

      // Respuesta con toda la información
      res.status(200).json({
        success: true,
        test: {
          basicConnection: !testError,
          hasData: !!data && data.length > 0,
          dataCount: data?.length || 0,
          error: error?.message || null
        },
        config: {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseKey
        },
        data: data || [],
        error: error?.message || null
      });

    } catch (error) {
      console.error('❌ Error en GET /api/test-supabase:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Método ${req.method} no permitido` });
  }
} 