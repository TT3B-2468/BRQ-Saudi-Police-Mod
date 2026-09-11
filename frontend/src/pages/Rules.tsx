import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Scale } from "lucide-react";
import { Reveal } from "@/components/Reveal";

const chapters = [
  {
    title: "قوانين الديسكورد",
    intro: "سيرفر ( B-R-Q ) يرحب بكم ..",
    rules: [
      "يمنع السب أو الشتم منعاً باتاً أو التلفظ بألفاظ نابية.",
      "يمنع التعرض للمواضيع العُنصرية، الدينية، العرقية، القبلية.",
      "يمنع إزعاج الإدارة بطلب رتبة أو ما شابه.",
      "يمنع استخدام كرت الصوت أو برامج تعديل الأصوات.",
      "يمنع تعدد الحسابات أو إنشاء حسابات وهمية.",
      "عدم التدخل بشؤون الإدارة.",
      "يمنع السبام بأنواعه عبر الشات العام أو غير ذلك.",
      "يمنع نشر الروابط الوهمية وروابط الباتشات وغيرها.",
      "يمنع استغلال الأخطاء أو الثغرات.",
      "عدم إزعاج الإدارة بتكرار المنشن.",
      "يمنع طلب رتبة إدارية.",
      "يمنع إرسال الصور المخلة بالأدب.",
      "يمنع سب الأعراض أو الأهل.",
      "يمنع البيع بجميع أنواعه.",
      "يمنع النشر في السيرفر بجميع أنواعه.",
      "يمنع التحدث بالمواضيع السياسية.",
      "أي مشاركة لا تتعلق بالسيرفر من مقاطع فيديو أو صور أو رسائل سيتم التعامل معها بالباند النهائي وغير قابل للفك أو النقاش.",
    ],
    outro: "أتمنى من العموم الالتزام بالقوانين مهما كانت رتبتك، كذلك إهمالك للأنظمة لا يعفيك من العقوبة. القوانين قابلة للتعديل.",
  },
  {
    title: "القوانين العامة",
    intro: "بسيرفر B-R-Q",
    rules: [
      "يجب عليك الخوف على حياتك وتقدير موقفك مع الآخرين (رول بلاي).",
      "يمنع استخدام المركبة كسلاح ودهس اللاعبين (VDM).",
      "يمنع استخدام السلاح بشكل عشوائي والقتل بدون سبب (RDM).",
      "عليك تقدير حياتك وموقفك في أي حالة من الحالات سواء عسكري أو مواطن، التقدير متبادل على الطرفين.",
      "يجب أن يكون اسمك في الهوية اسم أول وثاني واقعي.",
      "يمنع التواصل غير الشرعي وأنت داخل المجتمع، يجب عليك التواصل مع أصدقائك على موجة راديو ومخالفة ذلك (عقوبتها تحذيرين).",
      "يمنع السب والقذف والشتم بجميع أنواعه.",
      "يمنع التحدث في الراديو في حال كانت يديك مقيدتان وفي حال كنت تغوص تحت الماء.",
      "الاحترام المتبادل بين الجميع والالتزام بالتمثيل بشكل واقعي.",
      "يمنع تذكر الأحداث خلال مدة الإصابة.",
      "يسمح تذكر الأحداث قبل الإصابة.",
      "يمنع التكلم بأمور سياسية أو دينية.",
      "يمنع دخول السيرفر بالأسماء والصور غير اللائقة.",
      "يمنع منعاً باتاً طلوع الجبال أو أماكن وعرة بمركبة غير أوف رود مثل: فورد فكتوريا، كامري، إلخ.",
      "يمنع استخدام الثغرات في السيرفر.",
      "عدم إرسال روابط في الشات العام.",
      "يمنع ذكر سيرفرات أخرى أو نشر روابطهم.",
      "يمنع أخذ مركبات الحزم إذا لم تمتلك الرول.",
      "يمنع القتل في المناطق الآمنة مثل: (المراكز - المستشفيات).",
    ],
    outro: "جميع القوانين قابلة للتعديل والزيادة.",
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
            اطلع على قوانين الديسكورد والقوانين العامة بعناية — أسئلة الاختبار الإلكتروني مبنية عليها، والجهل بالقانون لا يعفي من المساءلة.
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
                      <div className="px-6 pb-7 pt-1">
                        <p className="text-sm text-[#FDE047] font-bold mb-4">{c.intro}</p>
                        <ol className="space-y-3.5">
                          {c.rules.map((r, ri) => (
                            <li key={ri} className="flex items-start gap-3 text-sm text-[#CBD5E1] leading-relaxed">
                              <span className="font-mono text-xs text-[#009E49] mt-1 w-6 shrink-0" dir="ltr">{ri + 1}.</span>
                              {r}
                            </li>
                          ))}
                        </ol>
                        <p className="text-xs text-[#94A3B8] mt-6 pt-4 border-t border-[#1E293B] leading-relaxed">{c.outro}</p>
                      </div>
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
