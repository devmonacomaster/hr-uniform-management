"use client";

import { useState } from "react";
import { Topbar } from "./Topbar";
import { Sidebar } from "./Sidebar";

export function Shell({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false); // drawer mobile

    return (
        <>
            <Topbar onOpenMenu={() => setOpen(true)} />
            <div className="pt-14 flex">
                <Sidebar openMobile={open} onCloseMobile={() => setOpen(false)} />
                <main className="flex-1 min-w-0 p-4">{children}</main>
            </div>
        </>
    );
}
