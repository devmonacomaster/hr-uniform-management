import { NextRequest, NextResponse } from 'next/server';

// EXEMPLO DE COMO CHAMAR OS TOKENS
// import { cookies, headers } from 'next/headers';
// const jar = await cookies();
// const meToken = jar.get('me_token')?.value || headers().get('x-me-token') || '';
// const apiToken = jar.get('api_token')?.value || headers().get('x-api-token') || '';


const PUBLIC_ROUTES = ['/', '/api', '/acesso-negado'];

function isPublic(pathname: string) {
    return PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'));
}
function isLocalhost(hostname: string) {
    return (
        (process.env.IS_LOCALHOST || '').toLowerCase() === 'true' &&
        (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.localhost'))
    );
}

export async function middleware(request: NextRequest) {
    const { pathname, search } = request.nextUrl;
    const host = request.nextUrl.hostname;

    const devMode = isLocalhost(host);
    const meToken = process.env.DEV_BEARER_TOKEN || '';
    const apiToken = process.env.DEV_API_BEARER_TOKEN || ''; // << NOVA VAR .env.local

    // Em localhost: garanta que os cookies de token estejam sempre atualizados
    if (devMode) {
        const currentMe = request.cookies.get('me_token')?.value;
        const currentApi = request.cookies.get('api_token')?.value;

        const shouldSetMe = meToken && currentMe !== meToken;
        const shouldSetApi = apiToken && currentApi !== apiToken;

        if (shouldSetMe || shouldSetApi) {
            const res = NextResponse.redirect(new URL(pathname + search, request.url));
            if (shouldSetMe) {
                res.cookies.set('me_token', meToken, {
                    httpOnly: true,
                    secure: false, // http em localhost
                    sameSite: 'lax',
                    path: '/',
                });
            }
            if (shouldSetApi) {
                res.cookies.set('api_token', apiToken, {
                    httpOnly: true,
                    secure: false,
                    sameSite: 'lax',
                    path: '/',
                });
            }
            return res;
        }
    }

    // Não bloquear NADA: apenas propagar tokens via headers em localhost (útil para server components)
    const res = NextResponse.next();
    if (devMode) {
        if (meToken) res.headers.set('x-me-token', meToken);
        if (apiToken) res.headers.set('x-api-token', apiToken);
    }
    return res;
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
};
