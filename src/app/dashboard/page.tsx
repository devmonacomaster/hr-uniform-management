// src/app/dashboard/page.tsx
import { cookies } from 'next/headers';
import { headers as nextHeaders } from 'next/headers';

// shadcn/ui
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    ExclamationTriangleIcon,
    PersonIcon,
    LockOpen1Icon,
    FileTextIcon,
} from '@radix-ui/react-icons';

export const dynamic = 'force-dynamic';

type UserData = {
    id: string;
    nome: string;
    email: string;
    avatar: string | null;
    departamento: string;
    cargo: string;
    empresa: string;
    ativo: 'True' | 'False' | string;
    permissoes: string[];
    rotas: string[];
};

type ApiResponse = {
    error: boolean;
    message: string;
    results?: UserData;
};

function isLocalhostEnv() {
    return (process.env.IS_LOCALHOST || '').toLowerCase() === 'true';
}

async function fetchMe(): Promise<ApiResponse> {
    const cookieStore = await cookies();
    let token = cookieStore.get('token')?.value;

    // Fallback em localhost: usa DEV_BEARER_TOKEN se não houver cookie
    if (!token && isLocalhostEnv() && process.env.DEV_BEARER_TOKEN) {
        token = process.env.DEV_BEARER_TOKEN;
    }

    if (!token) {
        return {
            error: true,
            message: 'Token ausente. Faça login no sistema externo.',
        };
    }

    const base = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost/sismonaco';

    const res = await fetch(`${base}/api/me`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
        },
        cache: 'no-store',
    });

    if (!res.ok) {
        return {
            error: true,
            message: `Falha ao buscar /api/me (status ${res.status})`,
        };
    }

    const data = (await res.json()) as ApiResponse;
    return data;
}

export default async function DashboardPage() {
    const data = await fetchMe();
    const h = await nextHeaders();
    const debug = h.get('x-auth-debug'); // opcional: mostra motivo quando middleware pula validação em dev

    if (data.error || !data.results) {
        return (
            <main className="mx-auto max-w-5xl p-6">
                <h1 className="mb-3 text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>

                <Alert variant="destructive" className="mb-4">
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    <AlertTitle>Não foi possível carregar os dados do usuário</AlertTitle>
                    <AlertDescription>
                        {data.message || 'Tente novamente. Em produção, faça login no sistema externo.'}
                    </AlertDescription>
                </Alert>

                {isLocalhostEnv() && (
                    <p className="text-sm text-muted-foreground">
                        Dica: em localhost, verifique <code>IS_LOCALHOST=true</code> e{' '}
                        <code>DEV_BEARER_TOKEN</code> no <code>.env.local</code>.
                        {debug ? (
                            <>
                                {' '}
                                (<span className="font-mono">x-auth-debug: {debug}</span>)
                            </>
                        ) : null}
                    </p>
                )}
            </main>
        );
    }

    const u = data.results;
    const ativo = String(u.ativo) === 'True';
    const initials = u.nome
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <main className="mx-auto max-w-5xl p-6">
            <div className="mb-4 flex items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
                {debug ? (
                    <Badge variant="outline" className="font-mono">
                        debug: {debug}
                    </Badge>
                ) : null}
            </div>

            <section className="grid gap-4">
                {/* Perfil */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <PersonIcon className="h-4 w-4" />
                            Perfil
                        </CardTitle>
                        <Badge
                            variant="outline"
                            className={ativo ? 'border-green-500/30 text-green-600 dark:text-green-400' : ''}
                        >
                            {ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={u.avatar ?? undefined} alt={u.nome} />
                                <AvatarFallback>{initials}</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="font-medium text-foreground">{u.nome}</div>
                                <div className="text-sm text-muted-foreground">{u.email}</div>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <div className="text-sm">
                                <span className="font-medium text-foreground">ID: </span>
                                <span className="font-mono text-muted-foreground">{u.id}</span>
                            </div>
                            <div className="text-sm">
                                <span className="font-medium text-foreground">Departamento: </span>
                                <span className="text-muted-foreground">{u.departamento}</span>
                            </div>
                            <div className="text-sm">
                                <span className="font-medium text-foreground">Cargo: </span>
                                <span className="text-muted-foreground">{u.cargo}</span>
                            </div>
                            <div className="text-sm">
                                <span className="font-medium text-foreground">Empresa: </span>
                                <span className="text-muted-foreground">{u.empresa}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Permissões */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <LockOpen1Icon className="h-4 w-4" />
                            Permissões
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {u.permissoes?.length ? (
                            <ScrollArea className="h-56 rounded-md border">
                                <ul className="divide-y">
                                    {u.permissoes.map((p) => (
                                        <li key={p} className="px-3 py-2">
                                            <code className="text-xs">{p}</code>
                                        </li>
                                    ))}
                                </ul>
                            </ScrollArea>
                        ) : (
                            <p className="text-sm text-muted-foreground">—</p>
                        )}
                    </CardContent>
                </Card>

                {/* Rotas liberadas */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <FileTextIcon className="h-4 w-4" />
                            Rotas liberadas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {u.rotas?.length ? (
                            <div className="flex flex-wrap gap-2">
                                {u.rotas.map((r) => (
                                    <Badge key={r} variant="outline" className="font-mono">
                                        {r}
                                    </Badge>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">—</p>
                        )}
                    </CardContent>
                </Card>

                {/* JSON completo (debug) */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">JSON completo</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Separator className="mb-3" />
                        <pre className="max-h-[420px] overflow-auto rounded-md border bg-muted p-3 text-xs text-muted-foreground">
              {JSON.stringify(data, null, 2)}
            </pre>
                    </CardContent>
                </Card>
            </section>
        </main>
    );
}
