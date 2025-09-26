"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ChevronDownIcon, GearIcon, DashboardIcon, LayersIcon, Component1Icon } from "@radix-ui/react-icons";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

function SidebarContent() {
    return (
        <div className="flex h-full flex-col">
            {/* navegação */}
            <nav className="flex-1 px-2 py-3 space-y-1">
                <Link href="/dashboard"
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent">
                    <DashboardIcon className="h-4 w-4"/>
                    Dashboard
                </Link>

                <Collapsible defaultOpen>
                    <CollapsibleTrigger asChild>
                        <button className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent">
                            <LayersIcon className="h-4 w-4"/>
                            Cadastro Base
                            <ChevronDownIcon className="ml-auto h-4 w-4 opacity-70"/>
                        </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-8 mt-1 space-y-1">
                        <Link
                            href="/parameters"
                            className="block rounded-md px-3 py-2 text-sm bg-accent/60"
                        >
                            Grupos e Parâmetros
                        </Link>
                        {/* ...outros itens */}
                    </CollapsibleContent>
                </Collapsible>

                <Link href="/configuracoes"
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent">
                    <GearIcon className="h-4 w-4"/>
                    Configurações
                </Link>
            </nav>
        </div>
    );
}

export function Sidebar({
                            openMobile,
                            onCloseMobile,
                        }: {
    openMobile?: boolean;
    onCloseMobile?: () => void;
}) {
    // ESC fecha o drawer mobile
    useEffect(() => {
        if (!openMobile) return;
        const fn = (e: KeyboardEvent) => e.key === "Escape" && onCloseMobile?.();
        window.addEventListener("keydown", fn);
        return () => window.removeEventListener("keydown", fn);
    }, [ openMobile, onCloseMobile ]);

    return (
        <>
            {/* desktop */}
            <aside className="hidden md:flex w-64 shrink-0 border-r h-[calc(100vh-3.5rem)] sticky top-14 bg-background">
                <SidebarContent/>
            </aside>

            {/* mobile drawer */}
            <Sheet open={!!openMobile} onOpenChange={(v) => !v && onCloseMobile?.()}>
                <SheetContent side="left" className="p-0 w-72 md:hidden">
                    <SidebarContent/>
                </SheetContent>
            </Sheet>
        </>
    );
}
