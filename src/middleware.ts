import { NextRequest, NextResponse } from 'next/server';

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

type UserData = {
    id: string;
    nome: string;
    avatar: string | null;
    departamento: string;
    cargo: string;
    empresa: string;
    ativo: string;
    permissoes: string[];
    rotas: string[];
};
type ApiResponse = { error: boolean; message: string; results?: UserData };

async function fetchUserData(token: string): Promise<UserData | null> {
    try {
        // Em dev você está usando backend local em HTTP; deixe como env ou caia no localhost
        const base = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost/sismonaco';
        console.log('[MW] /me → base:', base);
        const r = await fetch(`${base}/api/me`, {
            headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
            cache: 'no-store',
        });
        console.log('[MW] /me → status:', r.status);
        if (!r.ok) return null;
        const data = (await r.json()) as ApiResponse;
        if (data.error || !data.results) return null;
        return data.results!;
    } catch (e) {
        console.error('[MW] /me error:', e);
        return null;
    }
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const host = request.nextUrl.hostname;
    const devMode = isLocalhost(host);
    const devToken = process.env.DEV_BEARER_TOKEN || '';

    console.log('[MW] pathname:', pathname, 'host:', host, 'devMode:', devMode);

    // 1) Rotas públicas e /api internas passam direto
    if (isPublic(pathname) || pathname.startsWith('/api/')) {
        console.log('[MW] rota pública → next()');
        return NextResponse.next();
    }

    // 2) Em localhost: SEMPRE usar DEV_BEARER_TOKEN
    if (devMode) {
        if (!devToken) {
            console.warn('[MW] IS_LOCALHOST=true mas DEV_BEARER_TOKEN está vazio');
            const res = NextResponse.next();
            res.headers.set('x-auth-debug', 'dev_token_missing');
            return res; // segue sem bloquear para você depurar
        }

        // Se o cookie atual é diferente do token de dev, grava e recarrega
        const current = request.cookies.get('token')?.value;
        if (current !== devToken) {
            console.log('[MW] forçando DEV_BEARER_TOKEN no cookie e recarregando a rota');
            const res = NextResponse.redirect(new URL(pathname, request.url));
            res.cookies.set('token', devToken, {
                httpOnly: true,
                secure: false, // importante para HTTP em localhost
                sameSite: 'lax',
                path: '/',
            });
            return res;
        }

        // Valida com o devToken
        console.log('[MW] usando DEV_BEARER_TOKEN para validar /me...');
        const user = await fetchUserData(devToken);
        if (!user || user.ativo !== 'True') {
            console.log('[MW] /me falhou OU usuário inativo (dev)');
            const res = NextResponse.next(); // não bloqueia em dev
            res.headers.set('x-auth-debug', 'me_failed_or_inactive');
            return res;
        }

        // Autorização por prefixo
        const hasAccess = (user.rotas || []).some((route) => {
            if (!route) return false;
            const normalized = route.endsWith('/') ? route : route + '/';
            return pathname === route || pathname.startsWith(normalized);
        });
        console.log('[MW] hasAccess:', hasAccess, 'rotas:', user.rotas);

        if (!hasAccess) {
            const res = NextResponse.next(); // não bloqueia em dev
            res.headers.set('x-auth-debug', 'no_access');
            return res;
        }

        // Injeta dados do usuário
        const res = NextResponse.next();
        res.headers.set(
            'x-user-data',
            JSON.stringify({
                id: user.id,
                nome: user.nome,
                departamento: user.departamento,
                cargo: user.cargo,
                empresa: user.empresa,
                permissoes: user.permissoes,
                rotas: user.rotas,
            }),
        );
        return res;
    }

    // 3) Produção (não-dev): fluxo normal com ?token e cookie

    // 3.1) token via query (?token=...) → salva cookie e limpa a URL
    const urlToken = request.nextUrl.searchParams.get('token');
    if (urlToken) {
        console.log('[MW] token via query encontrado (prod)');
        const res = NextResponse.redirect(new URL(pathname, request.url));
        res.cookies.set('token', urlToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            path: '/',
        });
        return res;
    }

    // 3.2) precisa ter cookie em produção
    const cookieToken = request.cookies.get('token')?.value;
    if (!cookieToken) {
        console.log('[MW] sem token (prod) → redirecionando para LOGIN_URL');
        return NextResponse.redirect(
            process.env.LOGIN_URL ?? 'https://constellation-api.grupomonaco.com.br/sismonaco/login',
        );
    }

    // 3.3) valida usuário em produção
    console.log('[MW] chamando /me... (prod)');
    const user = await fetchUserData(cookieToken);
    if (!user || user.ativo !== 'True') {
        console.log('[MW] /me falhou OU usuário inativo (prod)');
        return NextResponse.redirect(
            process.env.LOGIN_URL ?? 'https://constellation-api.grupomonaco.com.br/sismonaco/login',
        );
    }

    // 3.4) autorização por prefixo
    const hasAccess = (user.rotas || []).some((route) => {
        if (!route) return false;
        const normalized = route.endsWith('/') ? route : route + '/';
        return pathname === route || pathname.startsWith(normalized);
    });
    console.log('[MW] hasAccess:', hasAccess, 'rotas:', user.rotas);

    if (!hasAccess) {
        const denied = process.env.ACCESS_DENIED_URL ?? '/acesso-negado';
        return NextResponse.redirect(new URL(denied, request.url));
    }

    // 3.5) injeta dados no header
    const res = NextResponse.next();
    res.headers.set(
        'x-user-data',
        JSON.stringify({
            id: user.id,
            nome: user.nome,
            departamento: user.departamento,
            cargo: user.cargo,
            empresa: user.empresa,
            permissoes: user.permissoes,
            rotas: user.rotas,
        }),
    );
    return res;
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
};
