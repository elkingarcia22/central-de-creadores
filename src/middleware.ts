import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  console.log('Middleware - URL:', req.nextUrl.pathname);
  
  // Temporalmente deshabilitar el middleware para evitar problemas de sesión
  // Dejar que el cliente maneje la autenticación
  console.log('Middleware - Deshabilitado temporalmente');
  return NextResponse.next();
  
  /*
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          req.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          req.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Verificar si hay una sesión activa
  const {
    data: { session },
  } = await supabase.auth.getSession();

  console.log('Middleware - Session exists:', !!session);

  // Rutas que requieren autenticación
  const protectedRoutes = [
    '/dashboard',
    '/investigaciones',
    '/reclutamiento',
    '/sesiones',
    '/metricas',
    '/participantes',
    '/empresas',
    '/configuraciones',
    '/conocimiento'
  ];

  // Verificar si la ruta actual requiere autenticación
  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  );

  console.log('Middleware - Is protected route:', isProtectedRoute);

  // Solo redirigir si es una ruta protegida, no hay sesión Y no es la página de login
  if (isProtectedRoute && !session && req.nextUrl.pathname !== '/login') {
    console.log('Middleware - Redirecting to login (no session)');
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    return NextResponse.redirect(redirectUrl);
  }

  // Permitir que todas las demás rutas continúen
  console.log('Middleware - Allowing request to continue');
  return response;
  */
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 