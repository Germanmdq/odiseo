import createMiddleware from 'next-intl/middleware';
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

const publicSegments = new Set([
  '',
  'landing',
  'login',
  'registro',
  'recuperar',
  'sign-in',
  'sign-in-2',
  'sign-in-3',
  'sign-up',
  'sign-up-2',
  'sign-up-3',
  'forgot-password',
  'forgot-password-2',
  'forgot-password-3',
  'errors',
]);

function getLocaleAndSegment(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  const maybeLocale = segments[0];
  const locale = routing.locales.includes(maybeLocale as 'es' | 'en')
    ? maybeLocale
    : routing.defaultLocale;
  const segment = maybeLocale === locale ? segments[1] ?? '' : segments[0] ?? '';

  return { locale, segment };
}

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie);
  });
}

export default async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return intlMiddleware(request);
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { locale, segment } = getLocaleAndSegment(request.nextUrl.pathname);
  const isPublic = publicSegments.has(segment);

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    url.search = '';
    const redirectResponse = NextResponse.redirect(url);
    copyCookies(supabaseResponse, redirectResponse);
    return redirectResponse;
  }

  const response = intlMiddleware(request);
  copyCookies(supabaseResponse, response);
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon\\.ico|.*\\..*).*)'
  ]
};
