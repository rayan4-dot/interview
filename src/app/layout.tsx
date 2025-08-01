
import type { Metadata } from 'next';
import './globals.css';
import { SidebarProvider, Sidebar, SidebarInset, SidebarContent, SidebarHeader, SidebarFooter, SidebarTrigger } from '@/components/ui/sidebar';
import { MainNav } from '@/components/main-nav';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Briefcase, BotMessageSquare } from 'lucide-react';
import Link from 'next/link';
import { AppModeProvider } from '@/hooks/use-app-mode';
import ModeSwitcher from '@/components/mode-switcher';

export const metadata: Metadata = {
  title: 'AI Interview Coach',
  description: 'Your personal AI-powered interview and career coach.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AppModeProvider>
          <SidebarProvider>
            <Sidebar>
              <SidebarContent className="p-2">
                <SidebarHeader>
                  <Link href="/" className="flex items-center gap-2">
                    <BotMessageSquare className="h-8 w-8 text-primary" />
                    <span className="font-headline text-xl font-semibold">AI Coach</span>
                  </Link>
                </SidebarHeader>
                <MainNav />
              </SidebarContent>
              <SidebarFooter>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-primary">
                    <AvatarImage src="https://placehold.co/100x100.png" alt="User Avatar" data-ai-hint="professional headshot" />
                    <AvatarFallback>
                      <User />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col truncate">
                    <span className="font-semibold text-foreground">Guest User</span>
                    <span className="text-xs text-muted-foreground">guest@example.com</span>
                  </div>
                </div>
              </SidebarFooter>
            </Sidebar>
            <SidebarInset>
              <header className="flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:h-14 md:justify-end md:gap-4">
                <SidebarTrigger className="md:hidden" />
                <ModeSwitcher />
                <Button asChild>
                  <Link href="/pricing">
                    <Briefcase className="mr-2 h-4 w-4" />
                    Upgrade Plan
                  </Link>
                </Button>
              </header>
              {children}
            </SidebarInset>
          </SidebarProvider>
        </AppModeProvider>
        <Toaster />
      </body>
    </html>
  );
}
