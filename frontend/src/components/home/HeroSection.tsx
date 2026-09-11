import { motion, useScroll, useTransform } from "framer-motion";
import { Play } from "lucide-react";
import { SiDiscord } from "@icons-pack/react-simple-icons";
import { toast } from "sonner";
import { HERO_IMAGE, DISCORD_URL } from "@/lib/config";

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

  const copyConnect = () => {
    toast.info("قريباً", { description: "سيتم إتاحة الدخول إلى السيرفر قريباً — تابعنا في الديسكورد." });
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

      <motion.div style={{ opacity: fade }} className="relative z-10 text-center px-4 pt-20">
        <motion.img
          src="/brq-banner.gif"
          alt="Welcome to BRQ"
          data-testid="hero-banner-img"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-4xl mx-auto mb-10 drop-shadow-[0_10px_40px_rgba(0,0,0,0.6)]"
        />
        <h1 className="font-heading font-extrabold tracking-tight text-white">
          <MaskedLine text="BRQ" delay={0.15} className="text-7xl sm:text-8xl lg:text-9xl leading-none drop-shadow-[0_0_40px_rgba(0,158,73,0.35)]" />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8 text-base md:text-lg text-[#CBD5E1] max-w-2xl mx-auto leading-relaxed"
          data-testid="hero-welcome-text"
        >
          مرحباً بك في سيرفر BRQ أفضل سيرفر عربي فايف أم حياة واقعية —
          عِش تجربة بأدق تفاصيلها واستمتع بلعب جدّي مع أعضاء BRQ.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
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
      </motion.div>
    </section>
  );
};
