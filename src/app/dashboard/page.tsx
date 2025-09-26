import { cookies } from 'next/headers';

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
    const flag = (process.env.IS_LOCALHOST || '').toLowerCase() === 'true';
    return flag;
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

    const base =
        process.env.NEXT_PUBLIC_API_BASE ??
        'http://localhost/sismonaco';

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

    if (data.error || !data.results) {
        return (
            <main style={{ padding: 24, maxWidth: 960, margin: '0 auto' }}>
                <h1 style={{ marginBottom: 12 }}>Dashboard</h1>
                <div
                    style={{
                        padding: 16,
                        border: '1px solid #e5e7eb',
                        borderRadius: 8,
                        background: '#fff7f7',
                    }}
                >
                    <strong>Não foi possível carregar os dados do usuário.</strong>
                    <p style={{ marginTop: 8 }}>
                        {data.message || 'Tente novamente. Em produção, faça login no sistema externo.'}
                    </p>
                    {isLocalhostEnv() ? (
                        <p style={{ marginTop: 8, fontSize: 12, color: '#6b7280' }}>
                            Dica: em localhost, verifique se <code>IS_LOCALHOST=true</code> e{' '}
                            <code>DEV_BEARER_TOKEN</code> estão definidos no <code>.env.local</code>.
                        </p>
                    ) : null}
                </div>
            </main>
        );
    }

    const u = data.results;

    return (
        <main style={{ padding: 24, maxWidth: 960, margin: '0 auto' }}>
            <h1 style={{ marginBottom: 12 }}>Dashboard</h1>

            <section
                style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gap: 16,
                }}
            >
                <div
                    style={{
                        padding: 16,
                        border: '1px solid #e5e7eb',
                        borderRadius: 8,
                        background: '#ffffff',
                    }}
                >
                    <h2 style={{ margin: '0 0 12px 0' }}>Perfil</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <div><strong>ID:</strong> {u.id}</div>
                            <div><strong>Nome:</strong> {u.nome}</div>
                            <div><strong>Email:</strong> {u.email}</div>
                            <div><strong>Ativo:</strong> {u.ativo}</div>
                        </div>
                        <div>
                            <div><strong>Departamento:</strong> {u.departamento}</div>
                            <div><strong>Cargo:</strong> {u.cargo}</div>
                            <div><strong>Empresa:</strong> {u.empresa}</div>
                            <div>
                                <strong>Avatar:</strong>{' '}
                                {u.avatar ? (
                                    <img
                                        src={u.avatar}
                                        alt="Avatar"
                                        style={{ width: 40, height: 40, borderRadius: '50%', verticalAlign: 'middle' }}
                                    />
                                ) : (
                                    '—'
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    style={{
                        padding: 16,
                        border: '1px solid #e5e7eb',
                        borderRadius: 8,
                        background: '#ffffff',
                    }}
                >
                    <h2 style={{ margin: '0 0 12px 0' }}>Permissões</h2>
                    {u.permissoes?.length ? (
                        <ul style={{ margin: 0, paddingLeft: 18 }}>
                            {u.permissoes.map((p) => (
                                <li key={p} style={{ marginBottom: 4 }}>
                                    <code>{p}</code>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div>—</div>
                    )}
                </div>

                <div
                    style={{
                        padding: 16,
                        border: '1px solid #e5e7eb',
                        borderRadius: 8,
                        background: '#ffffff',
                    }}
                >
                    <h2 style={{ margin: '0 0 12px 0' }}>Rotas liberadas</h2>
                    {u.rotas?.length ? (
                        <ul style={{ margin: 0, paddingLeft: 18 }}>
                            {u.rotas.map((r) => (
                                <li key={r}>
                                    <code>{r}</code>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div>—</div>
                    )}
                </div>

                <details
                    style={{
                        padding: 16,
                        border: '1px solid #e5e7eb',
                        borderRadius: 8,
                        background: '#ffffff',
                    }}
                >
                    <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Ver JSON completo</summary>
                    <pre
                        style={{
                            marginTop: 12,
                            padding: 12,
                            borderRadius: 8,
                            background: '#0b1020',
                            color: '#d1e7ff',
                            overflow: 'auto',
                        }}
                    >
{JSON.stringify(data, null, 2)}
          </pre>
                </details>
            </section>
        </main>
    );
}
