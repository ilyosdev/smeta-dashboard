import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Building2,
  ClipboardList,
  Wallet,
  Package,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NavItem = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  badge?: number;
};

const primaryNavItems: NavItem[] = [
  { icon: Home, label: "Bosh", href: "/" },
  { icon: Building2, label: "Loyihalar", href: "/projects" },
  { icon: ClipboardList, label: "So'rovlar", href: "/requests", badge: 8 },
  { icon: Wallet, label: "Moliya", href: "/finance" },
];

const secondaryNavItems: NavItem[] = [
  { icon: Package, label: "Ombor", href: "/warehouse" },
  { label: "Yetkazuvchilar", href: "/suppliers", icon: Package },
  { label: "Ustalar", href: "/workers", icon: Package },
  { label: "Tekshirish", href: "/validation", icon: Package },
  { label: "Hisobotlar", href: "/reports", icon: Package },
  { label: "Xodimlar", href: "/users", icon: Package },
  { label: "Sozlamalar", href: "/settings", icon: Package },
];

export function MobileNav() {
  const location = useLocation();
  const pathname = location.pathname;

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const isSecondaryActive = secondaryNavItems.some((item) => isActive(item.href));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border bg-card/95 backdrop-blur-md safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {primaryNavItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 py-2 relative transition-colors duration-200",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
              )}
              <div className="relative">
                <item.icon className={cn("h-5 w-5", active && "scale-110 transition-transform")} />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white px-1">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={cn("text-[10px] font-medium", active && "font-semibold")}>
                {item.label}
              </span>
            </Link>
          );
        })}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 py-2 relative transition-colors duration-200",
                isSecondaryActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              {isSecondaryActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
              )}
              <MoreHorizontal className={cn("h-5 w-5", isSecondaryActive && "scale-110 transition-transform")} />
              <span className={cn("text-[10px] font-medium", isSecondaryActive && "font-semibold")}>
                Boshqa
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 mb-2">
            {secondaryNavItems.map((item) => (
              <DropdownMenuItem key={item.href} asChild>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center gap-2 w-full",
                    isActive(item.href) && "text-primary font-medium"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
