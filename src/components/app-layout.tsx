
"use client";

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  BookCopy,
  Clapperboard,
  FileQuestion,
  FileText,
  LayoutDashboard,
  Settings,
  CircleUser,
  Crown,
  Film,
  LogIn,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import Image from 'next/image';

function SidebarNavigation() {
  const pathname = usePathname();

  const menuItems = [
    {
      href: '/',
      label: 'Tableau de bord',
      icon: LayoutDashboard,
    },
    {
      href: '/generate-course',
      label: 'Générateur de Cours',
      icon: BookCopy,
    },
    {
      href: '/generate-script',
      label: 'Script Vidéo',
      icon: Clapperboard,
    },
    {
      href: '/edit-video',
      label: 'Editeur Vidéo',
      icon: Film,
    },
    {
      href: '/generate-quiz',
      label: 'Générateur de Quiz',
      icon: FileQuestion,
    },
    {
      href: '/summarize-document',
      label: 'Synthèse de Document',
      icon: FileText,
    },
  ];

  return (
    <SidebarMenu>
      {menuItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href}
            tooltip={item.label}
          >
            <Link href={item.href}>
              <item.icon />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

function Header({ children }: { children: React.ReactNode }) {
    const [user, loading] = useAuthState(auth);
    const router = useRouter();

    const handleSignOut = async () => {
        await auth.signOut();
        router.push('/login');
    }

    return (
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
        {children}
        <div className="flex-1 text-right">
            {loading ? (
                <div />
            ) : user ? (
                <Button asChild>
                    <Link href="/subscribe">
                        <Crown className="mr-2 h-4 w-4" />
                        Passer au Premium
                    </Link>
                </Button>
            ) : (
                <Button asChild variant="outline">
                    <Link href="/login">
                        <LogIn className="mr-2 h-4 w-4" />
                        Se connecter
                    </Link>
                </Button>
            )}
        </div>
        </header>
    );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user] = useAuthState(auth);
  const router = useRouter();

  const handleSignOut = async () => {
    await auth.signOut();
    router.push('/login');
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2">
           <img src="https://www.boomrang-group.com/wp-content/uploads/2025/09/WhatsApp-Image-2025-09-07-a-19.08.28_2e9e8429.jpg" alt="Studio BoomRang Logo" width={32} height={32} className="rounded-full" data-ai-hint="logo camera" />
            <h2 className="text-xl font-bold font-headline text-primary">
              Studio BoomRang
            </h2>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarNavigation />
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            {user && (
                 <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === '/account'}>
                        <Link href="/account">
                            <CircleUser />
                            <span>Mon Compte</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            )}
             <SidebarMenuItem>
                {user ? (
                    <SidebarMenuButton onClick={handleSignOut}>
                        <LogOut/>
                        <span>Se déconnecter</span>
                    </SidebarMenuButton>
                ) : (
                     <SidebarMenuButton asChild isActive={pathname === '/login'}>
                        <Link href="/login">
                            <LogIn/>
                            <span>Se connecter</span>
                        </Link>
                    </SidebarMenuButton>
                )}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <Header>
          <SidebarTrigger className="md:hidden" />
        </Header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
