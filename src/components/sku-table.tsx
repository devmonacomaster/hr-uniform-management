import { cookies, headers as nextHeaders } from 'next/headers';
import Link from 'next/link';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ChevronLeftIcon, ChevronRightIcon, CheckCircledIcon, CrossCircledIcon,
} from '@radix-ui/react-icons';

type Sku = {
    sku_id: string;
    sku_code: string;
    description: string;
    uniform_size: string;
    status: string; // "1" ativo, outros = inativo
    product_id: string;
    product_name: string;
    color_id: string;
    color_name: string;
    business_id: string;
    business_name: string;
    created_at: string;
    updated_at: string;
};

type Pagination = {
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
};

type ApiResponse = {
    error: boolean;
    message: string;
    total: number;
    pagination: Pagination;
    filters: Record<string, unknown>;
    results: Sku[];
};

type SkuTableProps = {
    /** filtros/paginação via URL (ex.: page, limit, sku_id, etc.) */
    params?: Record<string, string | number | undefined>;
};

function buildQuery(nextParams: Record<string, string | number | undefined>) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(nextParams)) {
        if (v !== undefined && v !== null && String(v) !== '') qs.set(k, String(v));
    }
    return qs.toString();
}

export default async function SkuTable({ params = {} }: SkuTableProps) {
    // pega o token de API configurado pelo middleware
    const jar = await cookies();
    const hdrs = await nextHeaders();
    const apiToken =
        jar.get('api_token')?.value ||
        hdrs.get('x-api-token') ||
        process.env.DEV_API_BEARER_TOKEN || // fallback só pra dev
        '';

    const base = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost/sismonaco';

    const page = Number(params.page ?? 1);
    const limit = Number(params.limit ?? 10);

    const query = buildQuery({ ...params, page, limit });
    const url = `${base}/rh/uniformManagement/sku?${query}`;

    const res = await fetch(url, {
        headers: {
            Authorization: `Bearer ${apiToken}`,
            Accept: 'application/json',
        },
        cache: 'no-store',
    });

    if (!res.ok) {
        return (
            <div className="rounded-md border bg-destructive/10 p-4 text-sm text-foreground">
                Falha ao carregar SKUs (HTTP {res.status})
            </div>
        );
    }

    const data = (await res.json()) as ApiResponse;

    const { pagination } = data;
    const prevQuery = buildQuery({ ...params, page: Math.max(1, pagination.page - 1), limit });
    const nextQuery = buildQuery({
        ...params,
        page: Math.min(pagination.totalPages, pagination.page + 1),
        limit,
    });

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
                <div className="text-sm text-muted-foreground">
                    {data.total} registro(s) • página {pagination.page} de {pagination.totalPages}
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild disabled={!pagination.hasPrevPage}>
                        <Link href={`?${prevQuery}`} scroll={false}>
                            <ChevronLeftIcon className="mr-1 h-4 w-4" />
                            Anterior
                        </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild disabled={!pagination.hasNextPage}>
                        <Link href={`?${nextQuery}`} scroll={false}>
                            Próxima
                            <ChevronRightIcon className="ml-1 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Tabela */}
            <div className="overflow-x-auto rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="min-w-[140px]">SKU</TableHead>
                            <TableHead className="min-w-[220px]">Descrição</TableHead>
                            <TableHead>Tamanho</TableHead>
                            <TableHead>Produto</TableHead>
                            <TableHead>Cor</TableHead>
                            <TableHead>Empresa</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="min-w-[140px]">Criado</TableHead>
                            <TableHead className="min-w-[140px]">Atualizado</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.results.map((row) => {
                            const ativo = row.status === '1';
                            return (
                                <TableRow key={row.sku_id}>
                                    <TableCell className="font-mono">{row.sku_code}</TableCell>
                                    <TableCell className="text-foreground">{row.description}</TableCell>
                                    <TableCell>{row.uniform_size}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{row.product_name}</span>
                                            <span className="text-xs text-muted-foreground">#{row.product_id}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{row.color_name}</span>
                                            <span className="text-xs text-muted-foreground">#{row.color_id}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{row.business_name}</span>
                                            <span className="text-xs text-muted-foreground">#{row.business_id}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={ativo ? 'border-green-500/40 text-green-600 dark:text-green-400' : ''}
                                        >
                                            {ativo ? (
                                                <span className="inline-flex items-center gap-1">
                          <CheckCircledIcon className="h-3.5 w-3.5" /> Ativo
                        </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1">
                          <CrossCircledIcon className="h-3.5 w-3.5" /> Inativo
                        </span>
                                            )}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                        {row.created_at}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                        {row.updated_at}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            {/* Footer de paginação (repete os botões) */}
            <div className="flex items-center justify-end gap-2">
                <Button variant="outline" size="sm" asChild disabled={!pagination.hasPrevPage}>
                    <Link href={`?${prevQuery}`} scroll={false}>
                        <ChevronLeftIcon className="mr-1 h-4 w-4" />
                        Anterior
                    </Link>
                </Button>
                <Button variant="outline" size="sm" asChild disabled={!pagination.hasNextPage}>
                    <Link href={`?${nextQuery}`} scroll={false}>
                        Próxima
                        <ChevronRightIcon className="ml-1 h-4 w-4" />
                    </Link>
                </Button>
            </div>
        </div>
    );
}
