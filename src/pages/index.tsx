// src/pages/index.tsx
import { GetServerSideProps } from 'next';
import { createServerClient } from '@supabase/ssr';
import { GetServerSidePropsContext } from 'next';

export default function Home() {
  // Esta página nunca debería renderizarse porque siempre redirige en getServerSideProps
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Redirigiendo...
        </h2>
        <p className="text-muted-foreground">
          Un momento por favor
        </p>
      </div>
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return context.req.cookies[name];
          },
          set(name: string, value: string, options: any) {
            context.res.setHeader('Set-Cookie', `${name}=${value}; Path=/; ${options.httpOnly ? 'HttpOnly;' : ''} ${options.secure ? 'Secure;' : ''} SameSite=Lax`);
          },
          remove(name: string, options: any) {
            context.res.setHeader('Set-Cookie', `${name}=; Path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`);
          },
        },
      }
    );

    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }

    return {
      redirect: {
        destination: '/investigaciones',
        permanent: false,
      },
    };
  } catch (error) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
}
