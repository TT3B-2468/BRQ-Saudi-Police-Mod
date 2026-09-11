import { HeroSection } from "@/components/home/HeroSection";
import { Reveal } from "@/components/Reveal";
import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <>
      <HeroSection />
      <section id="about" className="py-24 lg:py-32 border-t border-[#1E293B] bg-[#080E16]" data-testid="about-section">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Reveal>
            <ShieldCheck className="w-12 h-12 text-[#D4AF37] mx-auto mb-6" />
            <p className="font-mono text-xs text-[#4ADE80] tracking-[0.3em] mb-3" dir="ltr">// ABOUT BRQ</p>
            <h2 className="font-heading font-extrabold text-3xl lg:text-5xl text-white tracking-tight mb-6">
              من نحن
            </h2>
            <p className="text-[#94A3B8] text-base md:text-lg leading-relaxed mb-6">
              BRQ مجتمع سعودي للحياة الواقعية في FiveM متخصص في محاكاة العمل الشرطي والأمني —
              دوريات، بلاغات، مطاردات، وتحقيقات ضمن منظومة انضباط واقعية مستوحاة من القطاعات الأمنية السعودية.
            </p>
            <p className="text-[#94A3B8] text-base leading-relaxed mb-10">
              للانضمام إلى صفوفنا: اجتز الاختبار الإلكتروني، وسجّل دخولك بالديسكورد لاستلام رتبتك تلقائياً.
            </p>
            <Link
              to="/exam"
              data-testid="about-exam-btn"
              className="inline-flex items-center gap-3 px-9 py-4 rounded-md bg-[#009E49] hover:bg-[#00b855] text-white font-bold transition-all shadow-[0_0_30px_rgba(0,158,73,0.4)]"
            >
              ابدأ الاختبار الإلكتروني
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
