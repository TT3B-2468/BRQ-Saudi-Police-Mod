import { motion, useScroll, useTransform } from "framer-motion";
import { Copy, Radio } from "lucide-react";
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
    <section data-testid="hero-section" className="relative min-h-screen flex items-center overflow-hidden scanlines">
      <motion.div style={{ y: bgY }} className="absolute inset-0">
        <img src={HERO_IMAGE} alt="دوريات الشرطة السعودية ليلاً" className="w-full h-[115%] object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#060A0E]/85 via-[#060A0E]/65 to-[#060A0E]" />
      </motion.div>

      <div className="beacon-red absolute top-0 bottom-0 right-0 w-28 pointer-events-none" />
      <div className="beacon-blue absolute top-0 bottom-0 left-0 w-28 pointer-events-none" />

      <div className="absolute top-24 left-4 lg:left-8 font-mono text-[11px] text-[#64748B] tracking-widest" dir="ltr">
        [SECTOR: RIYADH-01 // FREQ: 144.200 MHz]
      </div>

      <motion.div style={{ opacity: fade }} className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 pt-28 pb-20 w-full">
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

        <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-[1.15] tracking-tight text-white max-w-4xl">
          <MaskedLine text="مرحباً بك في سيرفر BRQ" delay={0.15} />
          <MaskedLine
            text="الحياة الواقعية للشرطة السعودية"
            delay={0.35}
            className="text-transparent bg-clip-text bg-gradient-to-l from-[#4ADE80] via-[#009E49] to-[#D4AF37]"
          />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-6 text-base md:text-lg text-[#CBD5E1] max-w-2xl leading-relaxed"
        >
          عِش تجربة الدوريات الأمنية بأدق تفاصيلها: مناوبات، بلاغات، مطاردات، وترقيات —
          ضمن منظومة انضباط واقعية مستوحاة من القطاعات الأمنية السعودية.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <button
            onClick={copyConnect}
            data-testid="connect-server-btn"
            className="group inline-flex items-center gap-3 px-7 py-4 rounded-md bg-[#009E49] hover:bg-[#00b855] text-white font-bold text-sm transition-all shadow-[0_0_30px_rgba(0,158,73,0.4)] hover:shadow-[0_0_45px_rgba(0,158,73,0.6)]"
          >
            <Radio className="w-4 h-4" />
            دخول السيرفر المباشر
            <Copy className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" />
          </button>
          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noreferrer"
            data-testid="join-discord-btn"
            className="inline-flex items-center gap-3 px-7 py-4 rounded-md border border-[#D4AF37]/60 text-[#FDE047] hover:bg-[#D4AF37]/10 font-bold text-sm transition-colors"
          >
            <SiDiscord size={18} />
            انضم لـ Discord BRQ
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.15 }}
          className="mt-14 grid grid-cols-3 max-w-md gap-px bg-[#1E293B] rounded-md overflow-hidden border border-[#1E293B]"
          data-testid="hero-stats"
        >
          {[
            { v: "4", l: "إدارات أمنية" },
            { v: "+900", l: "عضو مسجل" },
            { v: "24/7", l: "مناوبات مستمرة" },
          ].map((s) => (
            <div key={s.l} className="bg-[#0A1017]/90 px-4 py-4 text-center">
              <div className="font-heading font-extrabold text-xl text-[#FDE047]">{s.v}</div>
              <div className="text-[11px] text-[#94A3B8] mt-1">{s.l}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};
