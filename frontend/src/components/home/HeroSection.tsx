import { motion, useScroll, useTransform } from "framer-motion";
import { Play } from "lucide-react";
import { SiDiscord } from "@icons-pack/react-simple-icons";
import { toast } from "sonner";
import { HERO_IMAGE, CONNECT_CMD, DISCORD_URL } from "@/lib/config";

const MaskedLine = ({ text, delay, className }: { text: string; delay: number; className?: string }) => (
  <span className="block overflow-hidden pb-1">
    <motion.span
      className={`block ${className ?? ""}`}
      initial={{ y: "110%" }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {text}
    </motion.span>
  </span>
);

export const HeroSection = () => {
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 700], [0, 180]);
  const fade = useTransform(scrollY, [0, 500], [1, 0.35]);

  const copyConnect = async () => {
    try {
      await navigator.clipboard.writeText(CONNECT_CMD);
      toast.success("تم نسخ أمر الاتصال", { description: `افتح كونسول F8 في FiveM والصق: ${CONNECT_CMD}` });
    } catch {
      toast.info(CONNECT_CMD, { description: "انسخ الأمر يدوياً والصقه في كونسول F8" });
    }
  };

  return (
    <section data-testid="hero-section" className="relative min-h-screen flex items-center justify-center overflow-hidden scanlines">
      <motion.div style={{ y: bgY }} className="absolute inset-0">
        <img src={HERO_IMAGE} alt="دوريات الشرطة السعودية ليلاً" className="w-full h-[115%] object-cover" />
        <div className="absolute inset-0 bg-[#060A0E]/60" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#060A0E]/80 via-transparent to-[#060A0E]" />
      </motion.div>

      <div className="beacon-red absolute top-0 bottom-0 right-0 w-28 pointer-events-none" />
      <div className="beacon-blue absolute top-0 bottom-0 left-0 w-28 pointer-events-none" />

      <div className="absolute top-24 left-4 lg:left-8 font-mono text-[11px] text-[#64748B] tracking-widest z-10" dir="ltr">
        [SECTOR: RIYADH-01 // FREQ: 144.200 MHz]
      </div>

      <motion.div style={{ opacity: fade }} className="relative z-10 text-center px-4 pt-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#009E49]/40 bg-[#004D25]/30 mb-8"
          data-testid="server-status-pill"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ADE80] opacity-60" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#4ADE80]" />
          </span>
          <span className="text-xs text-[#86EFAC] font-mono">118/128 متصل الآن · 22ms</span>
        </motion.div>

        <h1 className="font-heading font-extrabold tracking-tight text-white">
          <MaskedLine text="BRQ" delay={0.15} className="text-7xl sm:text-8xl lg:text-9xl leading-none drop-shadow-[0_0_40px_rgba(0,158,73,0.35)]" />
          <MaskedLine
            text="الحياة الواقعية للشرطة السعودية"
            delay={0.35}
            className="mt-4 text-2xl sm:text-3xl lg:text-4xl text-transparent bg-clip-text bg-gradient-to-l from-[#4ADE80] via-[#009E49] to-[#D4AF37]"
          />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-6 text-base md:text-lg text-[#CBD5E1] max-w-2xl mx-auto leading-relaxed"
        >
          مرحباً بك في سيرفر BRQ أفضل سيرفر عربي فايف أم حياة واقعية —
          عِش تجربة الدوريات الأمنية بأدق تفاصيلها واستمتع بلعب جدّي مع أعضاء BRQ.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <button
            onClick={copyConnect}
            data-testid="connect-server-btn"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-md bg-[#009E49] hover:bg-[#00b855] text-white font-bold text-sm transition-all shadow-[0_0_30px_rgba(0,158,73,0.4)] hover:shadow-[0_0_45px_rgba(0,158,73,0.6)]"
          >
            <Play className="w-4 h-4" />
            دخول إلى السيرفر
          </button>
          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noreferrer"
            data-testid="join-discord-btn"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-md bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-sm transition-colors"
          >
            <SiDiscord size={18} />
            الديسكورد
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.15 }}
          className="mt-14 inline-grid grid-cols-3 gap-px bg-[#1E293B] rounded-md overflow-hidden border border-[#1E293B]"
          data-testid="hero-stats"
        >
          {[
            { v: "4", l: "إدارات أمنية" },
            { v: "+900", l: "عضو مسجل" },
            { v: "24/7", l: "مناوبات مستمرة" },
          ].map((s) => (
            <div key={s.l} className="bg-[#0A1017]/90 px-8 py-4 text-center">
              <div className="font-heading font-extrabold text-xl text-[#FDE047]">{s.v}</div>
              <div className="text-[11px] text-[#94A3B8] mt-1">{s.l}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};
