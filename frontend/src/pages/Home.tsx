import { HeroSection } from "@/components/home/HeroSection";
import { Marquee } from "@/components/home/Marquee";
import { Divisions } from "@/components/home/Divisions";
import { JoinSteps } from "@/components/home/JoinSteps";
import { NewsPreview } from "@/components/home/NewsPreview";
import { Reveal } from "@/components/Reveal";
import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <>
      <HeroSection />
      <Marquee />
      <Divisions />
      <JoinSteps />
      <NewsPreview />
      <section className="py-24 border-t border-[#1E293B] bg-gradient-to-b from-[#0B192C]/40 to-[#060A0E]" data-testid="cta-section">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Reveal>
            <ShieldCheck className="w-12 h-12 text-[#D4AF37] mx-auto mb-6" />
            <h2 className="font-heading font-extrabold text-3xl lg:text-5xl text-white tracking-tight mb-5">
              جاهز تلبس البدلة؟
            </h2>
            <p className="text-[#94A3B8] text-base md:text-lg mb-10 leading-relaxed">
              ابدأ بالاختبار الإلكتروني — خمس دقائق تفصلك عن رتبتك الأولى في سيرفر BRQ.
            </p>
            <Link
              to="/exam"
              data-testid="cta-exam-btn"
              className="inline-flex items-center gap-3 px-9 py-4 rounded-md bg-[#009E49] hover:bg-[#00b855] text-white font-bold transition-all shadow-[0_0_30px_rgba(0,158,73,0.4)]"
            >
              ابدأ الاختبار الآن
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
