"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Dumbbell, Apple, BarChart3, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const ITEMS = [
  { href: "/workout", label: "Workout", icon: Dumbbell },
  { href: "/diet", label: "Diet", icon: Apple },
  { href: "/history", label: "History", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function TopNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-14 flex items-center gap-4">
        <Link href="/workout" className="font-semibold tracking-tight">
          Forge
        </Link>
        <nav className="hidden md:flex items-center gap-1 ml-4">
          {ITEMS.map((item) => {
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-2 px-3 h-9 rounded-md text-sm transition-colors",
                  active
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {session?.user ? (
            <>
              <span className="hidden sm:inline text-xs text-muted-foreground truncate max-w-[180px]">
                {session.user.email}
              </span>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => signOut({ callbackUrl: "/" })}
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button asChild size="sm" variant="outline">
              <Link href="/signin">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

export function MobileTabBar() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Primary"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t bg-background/95 backdrop-blur"
    >
      <div className="grid grid-cols-4 h-14">
        {ITEMS.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 text-[10px]",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
