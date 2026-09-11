import { Link } from "react-router-dom";
import { SERVER_IP, DISCORD_URL } from "@/lib/config";

export const Footer = () => (
  <footer data-testid="main-footer" className="border-t border-[#1E293B] bg-[#080E16]">
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 grid gap-10 md:grid-cols-3">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <img src="/brq-logo.png" alt="شعار BRQ" className="w-11 h-11 object-contain" />
          <div>
            <div className="font-heading font-extrabold text-white">BRQ</div>
            <div className="text-[10px] text-[#94A3B8] font-mono tracking-[0.2em]">SAUDI POLICE MOD</div>
          </div>
        </div>
        <p className="text-sm text-[#94A3B8] leading-relaxed">
          BRQ | مجتمع سعودي للحياة الواقعية في FiveM — متخصصون في تجربة العمل الشرطي والأمني.
        </p>
      </div>
      <div>
        <h4 className="text-sm font-bold text-[#FDE047] mb-4 tracking-wide">روابط سريعة</h4>
        <div className="flex flex-col gap-2 text-sm text-[#94A3B8]">
          <Link to="/exam" className="hover:text-white transition-colors">الاختبار الإلكتروني</Link>
          <Link to="/rules" className="hover:text-white transition-colors">القوانين</Link>
          <Link to="/#about" className="hover:text-white transition-colors">من نحن</Link>
        </div>
      </div>
      <div>
        <h4 className="text-sm font-bold text-[#FDE047] mb-4 tracking-wide">الاتصال بالسيرفر</h4>
        <p className="font-mono text-sm text-[#4ADE80] mb-2" dir="ltr">{SERVER_IP}</p>
        <a href={DISCORD_URL} target="_blank" rel="noreferrer" className="text-sm text-[#94A3B8] hover:text-white transition-colors">
          مجتمع الديسكورد ←
        </a>
      </div>
    </div>
    <div className="border-t border-[#1E293B] py-5 text-center text-xs text-[#64748B]">
      BRQ | Saudi Police Mod © 2026 — مجتمع لعب تقمّص أدوار غير رسمي، ولا يتبع أي جهة حكومية.
    </div>
  </footer>
);
