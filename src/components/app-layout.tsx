
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
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from './ui/button';

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
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      {children}
    </header>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-8 w-8 text-primary"
              fill="currentColor"
            >
              <path d="M12 2L1 9l4 2.18v6.32L12 22l7-4.5V11.18L23 9 12 2zm-2 15.5V14h4v3.5l-2 1-2-1zM12 4.44L19.78 9 12 13.56 4.22 9 12 4.44z" />
            </svg>
            <h2 className="text-xl font-bold font-headline text-primary">
              Kelasi Studio
            </h2>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarNavigation />
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
               <SidebarMenuButton asChild isActive={pathname === '/account'}>
                  <Link href="/account">
                    <CircleUser />
                    <span>Mon Compte</span>
                  </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <Header>
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1 text-right">
            <Button>
              <Crown className="mr-2 h-4 w-4" />
              Passer au Premium
            </Button>
          </div>
        </Header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
