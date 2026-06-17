import Link from "next/link";
import { Lightbulb } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/pulse", label: "Pulse" },
  { href: "/risk", label: "Intervention Score" },
  { href: "/chat", label: "Chat" },
  { href: "/profile", label: "Profile" },
];

export function Header() {
  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Lightbulb className="h-5 w-5 text-primary" />
          Lighthouse
        </Link>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
