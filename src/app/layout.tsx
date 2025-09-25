import "./globals.css";
import { ThemeProvider } from "@/app/providers/ThemeProvider";
import { Shell } from "@/components/Shell";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="pt-BR" suppressHydrationWarning>
        <body className="min-h-screen bg-background text-foreground">
        <ThemeProvider>
            <Shell>{children}</Shell>
        </ThemeProvider>
        </body>
        </html>
    );
}
