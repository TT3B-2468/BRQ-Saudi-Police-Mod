import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ShieldCheck, XCircle, Timer, Award } from "lucide-react";
import { SiDiscord } from "@icons-pack/react-simple-icons";
import { apiGet, apiPost, ApiError } from "@/lib/api";
import type { QuizQuestion, QuizResult } from "@/lib/types";
import { ACCEPTED_ROLE_NAME } from "@/lib/config";
import { Reveal } from "@/components/Reveal";

export default function Exam() {
  const { data: questions, isError } = useQuery({
    queryKey: ["quiz-questions"],
    queryFn: () => apiGet<QuizQuestion[]>("/quiz/questions"),
    staleTime: Infinity,
    retry: false,
  });
  const [phase, setPhase] = useState<"intro" | "quiz" | "result">("intro");
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const start = () => {
    setPhase("quiz");
    setIdx(0);
    setAnswers([]);
    setSelected(null);
    setResult(null);
  };

  const next = () => {
    if (selected === null || !questions) return;
    const nextAnswers = [...answers, selected];
    if (idx + 1 === questions.length) {
      apiPost<QuizResult>("/quiz/submit", { answers: nextAnswers })
        .then((r) => {
          setResult(r);
          setPhase("result");
          if (!r.passed) setCooldown(60);
        })
        .catch(() => toast.error("تعذر تصحيح الاختبار — حاول مجدداً"));
    } else {
      setAnswers(nextAnswers);
      setIdx(idx + 1);
      setSelected(null);
    }
  };

  const connectDiscord = async () => {
    if (!result?.token) return;
    setConnecting(true);
    try {
      const { url } = await apiGet<{ url: string }>(`/discord/login?token=${encodeURIComponent(result.token)}`);
      window.location.href = url;
    } catch (e) {
      if (e instanceof ApiError && e.status === 503) {
        toast.info("ربط الديسكورد قيد التفعيل", {
          description: "سيتم تفعيل منح الرتبة التلقائي قريباً — تواصل مع الإدارة في الديسكورد لاستلام رتبتك يدوياً.",
        });
      } else if (e instanceof ApiError && e.status === 401) {
        toast.error("انتهت صلاحية رمز الاجتياز — أعد الاختبار");
      } else {
        toast.error("تعذر الاتصال بالديسكورد حالياً");
      }
      setConnecting(false);
    }
  };

  const q = questions?.[idx];

  return (
    <div className="pt-32 pb-24 min-h-screen" data-testid="exam-page">
      <div className="max-w-3xl mx-auto px-4">
        <Reveal>
          <p className="font-mono text-xs text-[#4ADE80] tracking-[0.3em] mb-3 text-center" dir="ltr">
            // POLICE ACADEMY — CAD TERMINAL
          </p>
          <h1 className="font-heading font-extrabold text-3xl lg:text-5xl text-white tracking-tight text-center mb-4">
            إلكتروني اختبار القبول
          </h1>
          <p className="text-[#94A3B8] text-center mb-12 text-base">
            خمسة أسئلة عن القوانين والبروتوكولات — تحتاج {4} من {5} (80%) للاجتياز واستلام رتبتك.
          </p>
        </Reveal>

        {isError ? (
          <div className="rounded-lg border border-[#1E293B] bg-[#0D141D] p-10 text-center text-[#94A3B8]" data-testid="exam-unavailable">
            الاختبار غير متاح حالياً — حاول لاحقاً.
          </div>
        ) : phase === "intro" ? (
          <Reveal delay={0.1}>
            <div className="gold-corners rounded-lg border border-[#1E293B] bg-[#0D141D] p-10 text-center scanlines relative" data-testid="exam-intro">
              <ShieldCheck className="w-14 h-14 text-[#009E49] mx-auto mb-6" />
              <h2 className="font-heading font-bold text-xl text-white mb-3">تعليمات الاختبار</h2>
              <ul className="text-sm text-[#94A3B8] space-y-2 mb-8 max-w-md mx-auto text-right">
                <li>· الأسئلة تغطي رموز الراديو، قواعد الاشتباك، وإجراءات التوقيف.</li>
                <li>· لا يمكن التراجع عن الإجابة بعد تأكيدها.</li>
                <li>· عند الرسوب يمكنك إعادة المحاولة بعد 60 ثانية.</li>
                <li>· عند الاجتياز تُمنح رتبة {ACCEPTED_ROLE_NAME} تلقائياً عبر الديسكورد.</li>
              </ul>
              <button
                onClick={start}
                disabled={!questions}
                data-testid="exam-start-btn"
                className="px-9 py-4 rounded-md bg-[#009E49] hover:bg-[#00b855] disabled:opacity-50 text-white font-bold transition-colors"
              >
                {questions ? "ابدأ الاختبار" : "جاري تحميل الأسئلة..."}
              </button>
            </div>
          </Reveal>
        ) : phase === "quiz" && q ? (
          <div className="rounded-lg border border-[#1E293B] bg-[#0D141D] p-8 lg:p-10" data-testid="exam-quiz-panel">
            <div className="flex items-center justify-between mb-3 text-xs font-mono text-[#64748B]">
              <span data-testid="exam-progress-label">السؤال {idx + 1} / {questions!.length}</span>
              <span className="text-[#38BDF8]">{q.category}</span>
            </div>
            <div className="h-1.5 rounded-full bg-[#111B27] overflow-hidden mb-8" dir="ltr">
              <motion.div
                className="h-full bg-gradient-to-r from-[#009E49] to-[#D4AF37]"
                animate={{ width: `${((idx + 1) / questions!.length) * 100}%` }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                data-testid="exam-progress-bar"
              />
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={q.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="font-heading font-bold text-xl text-white mb-8 leading-relaxed">{q.question}</h2>
                <div className="space-y-3">
                  {q.options.map((opt, oi) => (
                    <button
                      key={oi}
                      onClick={() => setSelected(oi)}
                      data-testid={`exam-option-${oi}`}
                      className={`w-full text-right px-5 py-4 rounded-md border text-sm transition-all ${
                        selected === oi
                          ? "border-[#009E49] bg-[#004D25]/30 text-white"
                          : "border-[#1E293B] bg-[#0A1017] text-[#CBD5E1] hover:border-[#273549] hover:bg-[#111B27]"
                      }`}
                    >
                      <span className="font-mono text-[#D4AF37] ml-3" dir="ltr">{String.fromCharCode(65 + oi)}.</span>
                      {opt}
                    </button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
            <button
              onClick={next}
              disabled={selected === null}
              data-testid="exam-next-btn"
              className="mt-8 w-full py-4 rounded-md bg-[#009E49] hover:bg-[#00b855] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold transition-colors"
            >
              {idx + 1 === questions!.length ? "إنهاء وإظهار النتيجة" : "السؤال التالي"}
            </button>
          </div>
        ) : result ? (
          <Reveal>
            <div
              className={`rounded-lg border p-10 text-center scanlines relative ${
                result.passed ? "border-[#009E49]/50 bg-[#004D25]/15" : "border-[#DC2626]/40 bg-[#2A0D0D]/30"
              }`}
              data-testid="exam-result-panel"
            >
              {result.passed ? (
                <>
                  <Award className="w-16 h-16 text-[#D4AF37] mx-auto mb-5" />
                  <h2 className="font-heading font-extrabold text-2xl text-white mb-2" data-testid="exam-result-title">
                    مبروك — اجتزت الاختبار
                  </h2>
                  <p className="text-[#94A3B8] mb-2">
                    نتيجتك: <span className="text-[#4ADE80] font-bold font-mono" dir="ltr">{result.score}/{result.total}</span>
                  </p>
                  <p className="text-sm text-[#94A3B8] mb-8 max-w-md mx-auto leading-relaxed">
                    الخطوة الأخيرة: سجّل دخولك بحساب الديسكورد وسيمنحك البوت رتبة{" "}
                    <span className="text-[#FDE047] font-bold">{ACCEPTED_ROLE_NAME}</span> تلقائياً في سيرفر BRQ.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <button
                      onClick={connectDiscord}
                      disabled={connecting}
                      data-testid="exam-discord-connect-btn"
                      className="inline-flex items-center gap-3 px-7 py-4 rounded-md bg-[#5865F2] hover:bg-[#4752C4] disabled:opacity-60 text-white font-bold transition-colors"
                    >
                      <SiDiscord size={18} />
                      {connecting ? "جاري التحويل للديسكورد..." : "تسجيل الدخول عبر الديسكورد"}
                    </button>
                    <Link
                      to="/"
                      data-testid="exam-home-link"
                      className="inline-flex items-center px-7 py-4 rounded-md border border-[#D4AF37]/60 text-[#FDE047] hover:bg-[#D4AF37]/10 font-bold transition-colors"
                    >
                      العودة للرئيسية
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="w-16 h-16 text-[#DC2626] mx-auto mb-5" />
                  <h2 className="font-heading font-extrabold text-2xl text-white mb-2" data-testid="exam-result-title">
                    لم تُجتز الاختبار هذه المرة
                  </h2>
                  <p className="text-[#94A3B8] mb-2">
                    نتيجتك: <span className="text-[#F87171] font-bold font-mono" dir="ltr">{result.score}/{result.total}</span> — المطلوب 4/5
                  </p>
                  <p className="text-sm text-[#94A3B8] mb-8">
                    راجع <Link to="/rules" className="text-[#38BDF8] hover:underline">صفحة القوانين</Link> ثم أعد المحاولة.
                  </p>
                  <button
                    onClick={start}
                    disabled={cooldown > 0}
                    data-testid="exam-retry-btn"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-md border border-[#1E293B] bg-[#0D141D] hover:bg-[#111B27] disabled:opacity-50 text-white font-bold transition-colors"
                  >
                    <Timer className="w-4 h-4 text-[#D4AF37]" />
                    {cooldown > 0 ? `إعادة المحاولة بعد ${cooldown} ثانية` : "إعادة الاختبار"}
                  </button>
                </>
              )}
            </div>
          </Reveal>
        ) : null}
      </div>
    </div>
  );
}
