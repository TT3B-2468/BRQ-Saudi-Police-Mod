import { Reveal } from "@/components/Reveal";
import { ClipboardCheck, GraduationCap, FileText, ShieldCheck } from "lucide-react";
import { SiDiscord } from "@icons-pack/react-simple-icons";
import { ACCEPTED_ROLE_NAME } from "@/lib/config";

const steps = [
  {
    id: "quiz",
    icon: ClipboardCheck,
    title: "اجتز الاختبار الإلكتروني",
    desc: "خمسة أسئلة عن قوانين السيرفر وبروتوكولات الشرطة — تحتاج 80% للنجاح.",
  },
  {
    id: "discord",
    icon: SiDiscord,
    title: "سجّل دخولك بالديسكورد",
    desc: "بعد النجاح، اربط حسابك في الديسكورد بضغطة واحدة عبر التوثيق الرسمي.",
  },
  {
    id: "role",
    icon: ShieldCheck,
    title: "استلم رتبتك تلقائياً",
    desc: `يمنحك البوت رتبة ${ACCEPTED_ROLE_NAME} فوراً في سيرفر الديسكورد دون انتظار.`,
  },
  {
    id: "apply",
    icon: FileText,
    title: "قدّم طلب الالتحاق",
    desc: "أكمل نموذج التقديم للإدارة التي تريدها وتابع حالة طلبك.",
  },
];

export const JoinSteps = () => (
  <section className="py-24 bg-[#080E16] border-y border-[#1E293B]" data-testid="join-steps-section">
    <div className="max-w-7xl mx-auto px-4 lg:px-8">
      <Reveal>
        <p className="font-mono text-xs text-[#D4AF37] tracking-[0.3em] mb-3" dir="ltr">// ENLISTMENT PROTOCOL</p>
        <h2 className="font-heading font-extrabold text-3xl lg:text-5xl text-white tracking-tight mb-14">
          كيف تنضم إلى صفوفنا
        </h2>
      </Reveal>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <Reveal key={s.id} delay={i * 0.1}>
            <div
              data-testid={`join-step-${s.id}`}
              className="tactical-card relative rounded-lg border border-[#1E293B] bg-[#0D141D] p-7 h-full"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-md bg-[#004D25]/40 border border-[#009E49]/40 flex items-center justify-center">
                  <s.icon className="w-5 h-5 text-[#4ADE80]" />
                </div>
                <span className="font-mono text-3xl font-bold text-[#1E293B]" dir="ltr">0{i + 1}</span>
              </div>
              <h3 className="font-heading font-bold text-lg text-white mb-2">{s.title}</h3>
              <p className="text-sm text-[#94A3B8] leading-relaxed">{s.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal delay={0.3}>
        <div className="mt-10 flex items-center gap-3 text-xs text-[#64748B] font-mono">
          <GraduationCap className="w-4 h-4 text-[#D4AF37]" />
          الرتب الأعلى (رقيب فما فوق) تُمنح بعد التدريب الميداني داخل السيرفر.
        </div>
      </Reveal>
    </div>
  </section>
);
