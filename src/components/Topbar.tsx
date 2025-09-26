"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ThemeToggle } from "./ThemeToggle";
import { Sidebar } from "./Sidebar";
import { Component1Icon, DashboardIcon, HamburgerMenuIcon } from "@radix-ui/react-icons";
import Link from "next/link";

export function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
    return (
        <header className="fixed top-0 inset-x-0 z-50 h-14 border-b bg-background/0 backdrop-blur">
            <div className="h-full flex items-center gap-3 px-4">
                {/* hambúrguer mobile */}
                <Button variant="ghost" size="icon" className="md:hidden" onClick={onOpenMenu} aria-label="Abrir menu">
                    <HamburgerMenuIcon/>
                </Button>

                {/* logo */}
                <div className="h-14 flex items-center px-4 border-b md:border-0">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <img
                            src="/monaco.svg"
                            alt="Logo SisMônaco"
                            className="h-5 w-5"
                        />
                        <span>SisMônaco</span>
                    </Link>
                </div>

                {/* espaço à esquerda para alinhar com sidebar fixa no desktop */}
                <div className="hidden md:block w-64"/>

                {/* título/slot à esquerda se quiser */}
                <div className="font-medium"/>

                <div className="ml-auto flex items-center gap-3">
                    {/* tema claro/escuro */}
                    <ThemeToggle/>

                    {/* perfil do usuário */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage alt="Avatar"/>
                                    <AvatarFallback>RM</AvatarFallback>
                                </Avatar>
                                <span className="hidden sm:inline-flex text-sm font-medium">
                                    Raimundos Marques Da Silva Neto
                                </span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64">
                            <DropdownMenuLabel>
                                <div className="flex flex-col">
                                    <span className="font-medium">Raimundos Marques Da Silva Neto</span>
                                    <span className="text-xs text-muted-foreground">Auxiliar de TI • Ativo</span>
                                    <span
                                        className="text-xs text-muted-foreground">raimundosmarque@grupomonaco.com.br</span>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator/>
                            <DropdownMenuItem>Meu Perfil</DropdownMenuItem>
                            <DropdownMenuItem>Configurações</DropdownMenuItem>
                            <DropdownMenuSeparator/>
                            <DropdownMenuItem>Sair</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
