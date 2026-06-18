import Link from "next/link";
import { Lightbulb } from "lucide-react";
import { TextReveal } from "@/components/ui/cascade-text";
import { NavHeader } from "@/components/ui/nav-header";

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
          <TextReveal
            as="span"
            text="Lighthouse"
            fontSize="1rem"
            hoverColor="var(--primary)"
            className="normal-case! font-semibold!"
            style={{ padding: 0 }}
          />
        </Link>
        <NavHeader items={navItems} />
      </div>
    </header>
  );
}
