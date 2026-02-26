"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession, signOut } from "@/lib/auth-client";

function getInitials(
  name: string | null | undefined,
  email: string | null | undefined
): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0])
        .toUpperCase()
        .slice(0, 2);
    }
    return name.slice(0, 2).toUpperCase();
  }
  if (email) {
    return email.slice(0, 2).toUpperCase();
  }
  return "?";
}

export function HeaderAuth() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  if (isPending) {
    return (
      <header className="flex justify-end py-3 px-4">
        <div className="h-8 w-16 animate-pulse rounded bg-muted" aria-hidden />
      </header>
    );
  }

  if (!session?.user) {
    return (
      <header className="flex justify-end gap-3 py-3 px-4">
        <nav className="flex items-center gap-3" aria-label="Autenticación">
          <Link
            href="/login"
            className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
          >
            Registrarse
          </Link>
        </nav>
      </header>
    );
  }

  const initials = getInitials(
    session.user.name ?? null,
    session.user.email ?? null
  );

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  return (
    <header className="flex justify-end py-3 px-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="rounded-full ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Abrir menú de cuenta"
          >
            <Avatar>
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href="/dashboard">Dashboard</Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onSelect={(e) => {
              e.preventDefault();
              void handleSignOut();
            }}
          >
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
