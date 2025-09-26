import { NextRequest, NextResponse } from 'next/server';

interface UserData {
    id: string;
    nome: string;
    avatar: string | null;
    departamento: string;
    cargo: string;
    empresa: string;
    ativo: string | boolean;
    permissoes: string[];
    rotas: string[];
}

interface ApiResponse {
    error: boolean;
    message: string;
    results: UserData;
}

async function fetchUserData(token: string): Promise<UserData | null> {
    try {
        const response = await fetch(
            'https://constellation-api.grupomonaco.com.br/sismonaco/api/me',
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
                cache: 'no-store',
            }
        );

        if (!response.ok) return null;

        const data: ApiResponse = await response.json();
        if (data.error || !data.results) return null;

        return data.results;
    } catch {
        return null;
    }
}

const PUBLIC_ROUTES = ['/login', '/acesso-negado', '/api'];

function isPublic(pathname: string) {
    if (pathname === '/login' || pathname === '/acesso-negado') return true;
    return pathname === '/api' || pathname.startsWith('/api/');

}

function pathWithSlash(p: string) {
    return p.endsWith('/') ? p : p + '/';
}

export async function middleware(request: NextRequest) {
    const { nextUrl } = request;
    const { pathname } = nextUrl;

    // Capturei o token e transformei em um Cookie HTTP Only
    const tokenFromQS = nextUrl.searchParams.get('token');
    if (tokenFromQS) {
        const cleanUrl = new URL(nextUrl.pathname, nextUrl.origin);
        const res = NextResponse.redirect(cleanUrl);

        res.cookies.set('token', tokenFromQS, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 15,
        });

        return res;
    }

    // Deixo que rotas públicas passem direto
    if (isPublic(pathname)) {
        return NextResponse.next();
    }

    // Faço a leitura desse token em todas as outras rotas
    const token = request.cookies.get('token')?.value;
    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Chamo o /me pra validar a sessão
    const userData = await fetchUserData(token);
    if (!userData) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Verificação para quando o usuário está inativo no constellation
    const ativoStr = String(userData.ativo).toLowerCase();
    const isActive =
        ativoStr === 'true' || ativoStr === '1' || ativoStr === 'yes' || ativoStr === 'ativo';
    if (!isActive) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // userData.rotas é a lista de rotas que esse usuário tem permissão de acessar
    // Sendo assim fazemos uma verificação, caso o usuário tente acessar uma rota não permitida
    const current = pathWithSlash(pathname);
    const hasAccess = (userData.rotas || []).some((r) => current.startsWith(pathWithSlash(r)));
    if (!hasAccess) {
        return NextResponse.redirect(new URL('/acesso-negado', request.url));
    }

    // Propago esses headers apenas no SSR
    const reqHeaders = new Headers(request.headers);
    reqHeaders.set('authorization', `Bearer ${token}`);
    reqHeaders.set('x-user-id', userData.id);
    reqHeaders.set('x-user-roles', JSON.stringify(userData.permissoes || []));

    return NextResponse.next({
        request: { headers: reqHeaders },
    });
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|public/).*)',
    ],
};
