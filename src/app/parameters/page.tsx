// src/app/estoque/skus/page.tsx
import SkuTable from '@/components/sku-table';

export const dynamic = 'force-dynamic';

export default async function SkusPage({
                                           searchParams,
                                       }: {
    searchParams: Record<string, string | string[] | undefined>;
}) {
    // normaliza searchParams para string | number
    const params: Record<string, string | number | undefined> = {};
    for (const [k, v] of Object.entries(searchParams)) {
        params[k] = Array.isArray(v) ? v[0] : v;
    }
    // defaults
    params.page = Number(params.page ?? 1);
    params.limit = Number(params.limit ?? 10);

    return (
        <main className="mx-auto max-w-6xl p-6">
            <h1 className="mb-4 text-2xl font-semibold tracking-tight text-foreground">SKUs</h1>
            <SkuTable params={params} />
        </main>
    );
}
