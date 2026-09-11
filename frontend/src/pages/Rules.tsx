import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Scale } from "lucide-react";
import { Reveal } from "@/components/Reveal";

const chapters = [
  {
    title: "القوانين العامة للسيرفر",
    rules: [
      "يُمنع الخروج عن الشخصية (OOC) داخل مناطق اللعب — استخدم قنوات الديسكورد المخصصة.",
      "يُمنع الـ RDM (القتل العشوائي) والـ VDM (الدهس العشوائي) منعاً باتاً.",
      "الاحترام المتبادل إلزامي — أي إساءة عنصرية أو شخصية تعرضك للحظر النهائي.",
      "يُمنع استغلال الثغرات (Exploits) أو استخدام برامج خارجية بأي شكل.",
      "قرارات الإشراف داخل السيرفر نهائية — الاعتراض يكون عبر تذكرة في الديسكورد.",
    ],
  },
  {
    title: "بروتوكول الدوريات والاشتباك",
    rules: [
      "لا يُستخدم السلاح الناري إلا عند وجود تهديد مباشر على حياتك أو حياة الآخرين.",
      "عند إيقاف أي مركبة: أبلغ غرفة العمليات بالموقع ورقم اللوحة قبل النزول.",
      "المطاردات تتم بتنسيق من قائد الميدان — ممنوع الاصطدام المتعمد (PIT) دون إذن.",
      "عند توجيه سلاح نحوك، يجب تجسيد الخوف (Fear RP) والامتثال للأوامر.",
      "المداهمات والاقتحامات تتطلب إذناً من رتبة نقيب فأعلى وتوثيقاً بالبلاغ.",
    ],
  },
  {
    title: "الراديو ورموز الـ 10-Codes",
    rules: [
      "10-4: تم الاستلام والفهم — 10-9: أعد الرسالة — 10-20: الموقع الحالي.",
      "10-31: جريمة قيد التنفيذ — 10-32: شخص مسلح — 10-71: إطلاق نار.",
      "ممنوع الكلام العام في قناة العمليات — الراديو للبلاغات والتنسيق فقط.",
      "عند سماع Code 0 (ضابط في خطر) تتجه جميع الوحدات المتاحة فوراً.",
      "اذكر رقم وحدتك وموقعك في بداية كل بلاغ.",
    ],
  },
  {
    title: "المصفوفة الانضباطية",
    rules: [
      "المخالفة الأولى: تنبيه شفهي موثق في الملف العسكري.",
      "المخالفة الثانية: إيقاف عن المناوبة لمدة 48 ساعة.",
      "المخالفة الثالثة: تنزيل رتبة أو إحالة للتحقيق الإداري.",
      "المخالفات الجسيمة (فساد، إفشاء معلومات): فصل نهائي دون إنذار.",
      "يحق لك استئناف أي قرار تأديبي خلال 72 ساعة عبر الإدارة العليا.",
    ],
  },
];

export default function Rules() {
  const [open, setOpen] = useState(0);
  return (
    <div className="pt-32 pb-24 min-h-screen" data-testid="rules-page">
      <div className="max-w-4xl mx-auto px-4">
        <Reveal>
          <div className="flex items-center gap-4 mb-4">
            <Scale className="w-8 h-8 text-[#D4AF37]" />
            <p className="font-mono text-xs text-[#4ADE80] tracking-[0.3em]" dir="ltr">// RULES OF ENGAGEMENT</p>
          </div>
          <h1 className="font-heading font-extrabold text-3xl lg:text-5xl text-white tracking-tight mb-4">
            قوانين سيرفر BRQ
          </h1>
          <p className="text-[#94A3B8] mb-14 text-base leading-relaxed">
            اطلع على الفصول الأربعة بعناية — أسئلة الاختبار الإلكتروني مبنية عليها، والجهل بالقانون لا يعفي من المساءلة.
          </p>
        </Reveal>

        <div className="space-y-4">
          {chapters.map((c, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <div
                className={`rounded-lg border overflow-hidden transition-colors ${
                  open === i ? "border-[#009E49]/50 bg-[#0D141D]" : "border-[#1E293B] bg-[#0A1017]"
                }`}
              >
                <button
                  onClick={() => setOpen(open === i ? -1 : i)}
                  data-testid={`rule-chapter-${i}`}
                  className="w-full flex items-center justify-between p-6 text-right"
                >
                  <div className="flex items-center gap-5">
                    <span className="font-mono text-2xl font-bold text-[#D4AF37]/70" dir="ltr">
                      0{i + 1}
                    </span>
                    <span className="font-heading font-bold text-lg text-white">{c.title}</span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-[#94A3B8] transition-transform duration-300 ${open === i ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <ul className="px-6 pb-7 pt-1 space-y-3.5">
                        {c.rules.map((r, ri) => (
                          <li key={ri} className="flex items-start gap-3 text-sm text-[#CBD5E1] leading-relaxed">
                            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#009E49] shrink-0" />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
