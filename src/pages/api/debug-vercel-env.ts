import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const envCheck = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      vercel: process.env.VERCEL,
      vercelEnv: process.env.VERCEL_ENV,
      vercelRegion: process.env.VERCEL_REGION,
      variables: {
        NEXT_PUBLIC_SUPABASE_URL: {
          exists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          value: process.env.NEXT_PUBLIC_SUPABASE_URL ? 
            process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30) + '...' : 
            'NOT_SET'
        },
        NEXT_PUBLIC_SUPABASE_ANON_KEY: {
          exists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 30) + '...' : 
            'NOT_SET'
        },
        SUPABASE_SERVICE_ROLE_KEY: {
          exists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
          value: process.env.SUPABASE_SERVICE_ROLE_KEY ? 
            process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 30) + '...' : 
            'NOT_SET'
        },
        GOOGLE_CLIENT_ID: {
          exists: !!process.env.GOOGLE_CLIENT_ID,
          value: process.env.GOOGLE_CLIENT_ID ? 
            process.env.GOOGLE_CLIENT_ID.substring(0, 20) + '...' : 
            'NOT_SET'
        },
        GOOGLE_CLIENT_SECRET: {
          exists: !!process.env.GOOGLE_CLIENT_SECRET,
          value: process.env.GOOGLE_CLIENT_SECRET ? 
            process.env.GOOGLE_CLIENT_SECRET.substring(0, 20) + '...' : 
            'NOT_SET'
        }
      },
      allEnvKeys: Object.keys(process.env).filter(key => 
        key.includes('SUPABASE') || 
        key.includes('GOOGLE') || 
        key.includes('VERCEL') ||
        key.includes('NEXT_PUBLIC')
      ).sort()
    };

    return res.status(200).json({
      message: 'Diagnóstico de variables de entorno en Vercel',
      ...envCheck
    });

  } catch (error) {
    console.error('❌ Error en debug-vercel-env:', error);
    return res.status(500).json({ 
      error: 'Error en diagnóstico',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}
