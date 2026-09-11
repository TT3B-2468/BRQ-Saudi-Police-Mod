import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Shield, Menu } from "lucide-react";
import { SiDiscord } from "@icons-pack/react-simple-icons";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { DISCORD_URL } from "@/lib/config";

const links = [
  { to: "/rules", id: "rules", label: "القوانين" },
  { to: "/news", id: "news", label: "الأخبار" },
  { to: "/#about", id: "about", label: "من نحن" },
  { to: "/exam", id: "exam", label: "الاختبار الإلكتروني" },
];

const linkCls = (active: boolean) =>
  `px-4 py-2 text-sm rounded-md transition-colors ${
    active
      ? "text-[#FDE047] bg-[#111B27] border border-[#D4AF37]/30"
      : "text-[#CBD5E1] hover:text-white hover:bg-[#0D141D] border border-transparent"
  }`;

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  return (
    <header
      data-testid="main-header"
      className="fixed top-0 z-50 w-full h-20 border-b border-[#1E2D42]/60 bg-[#060A0E]/70 backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto h-full px-4 lg:px-8 flex items-center justify-between">
        <Link to="/" data-testid="logo-link" className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-md bg-gradient-to-br from-[#009E49] to-[#004D25] border border-[#D4AF37]/50 flex items-center justify-center shadow-[0_0_24px_rgba(0,158,73,0.35)]">
            <Shield className="w-6 h-6 text-[#FDE047]" />
          </div>
          <div className="leading-tight">
            <div className="font-heading font-extrabold text-lg tracking-tight text-white">BRQ</div>
            <div className="text-[10px] text-[#94A3B8] font-mono tracking-[0.2em]">SAUDI POLICE MOD</div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1" data-testid="desktop-nav">
          {links.map((l) =>
            l.to.includes("#") ? (
              <Link key={l.id} to={l.to} data-testid={`nav-${l.id}`} className={linkCls(false)}>
                {l.label}
              </Link>
            ) : (
              <NavLink key={l.id} to={l.to} data-testid={`nav-${l.id}`}
                className={({ isActive }) => linkCls(isActive)}>
                {l.label}
              </NavLink>
            )
          )}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noreferrer"
            data-testid="discord-login-btn"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#5865F2] hover:bg-[#4752C4] text-white text-sm font-semibold transition-colors"
          >
            <SiDiscord size={16} />
            دخول عبر الديسكورد
          </a>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              data-testid="mobile-menu-btn"
              className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-md border border-[#1E293B] text-[#CBD5E1] hover:bg-[#111B27]"
            >
              <Menu className="w-5 h-5" />
            </SheetTrigger>
            <SheetContent side="right" className="bg-[#0D141D] border-[#1E293B] w-72">
              <SheetTitle className="text-white font-heading">القائمة</SheetTitle>
              <nav className="flex flex-col gap-2 mt-6">
                {links.map((l) => (
                  <Link key={l.id} to={l.to} onClick={() => setOpen(false)} data-testid={`mobile-nav-${l.id}`}
                    className="px-4 py-3 rounded-md text-sm text-[#CBD5E1] hover:bg-[#111B27] transition-colors">
                    {l.label}
                  </Link>
                ))}
                <a href={DISCORD_URL} target="_blank" rel="noreferrer" data-testid="mobile-discord-btn"
                  className="mt-4 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-[#5865F2] text-white text-sm font-semibold">
                  <SiDiscord size={16} />
                  دخول عبر الديسكورد
                </a>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
