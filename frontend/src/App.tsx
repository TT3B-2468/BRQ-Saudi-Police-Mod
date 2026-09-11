import { useEffect, useRef } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Lenis from "lenis";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Home from "@/pages/Home";
import Exam from "@/pages/Exam";
import Rules from "@/pages/Rules";
import Apply from "@/pages/Apply";
import NewsPage from "@/pages/NewsPage";
import AdminLogin from "@/pages/AdminLogin";
import Admin from "@/pages/Admin";
import DiscordResult from "@/pages/DiscordResult";

export default function App() {
  const lenisRef = useRef<Lenis | null>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    const lenis = new Lenis({ autoRaf: true });
    lenisRef.current = lenis;
    return () => lenis.destroy();
  }, []);

  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true });
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[#060A0E] text-[#F8FAFC]">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/exam" element={<Exam />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/apply" element={<Apply />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/discord/result" element={<DiscordResult />} />
        </Routes>
      </main>
      <Footer />
      <Toaster richColors theme="dark" position="bottom-right" />
    </div>
  );
}
