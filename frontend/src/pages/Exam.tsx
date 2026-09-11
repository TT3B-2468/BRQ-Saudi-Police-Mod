import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ShieldCheck, XCircle, Timer, Award, LogOut, CheckCircle2, AlertTriangle } from "lucide-react";
import { SiDiscord } from "@icons-pack/react-simple-icons";
import { apiGet, apiPost, ApiError } from "@/lib/api";
import type { QuizQuestion, QuizResult, DiscordMember } from "@/lib/types";
import { ACCEPTED_ROLE_NAME, DISCORD_URL } from "@/lib/config";
import { Reveal } from "@/components/Reveal";

const FAIL_REASONS: Record<string, string> = {
  config: "ربط الديسكورد غير مفعّل بعد — تواصل مع الإدارة.",
  state: "انتهت صلاحية طلب الدخول — حاول مجدداً.",
  denied: "تم إلغاء تسجيل الدخول من الديسكورد.",
  token: "فشل تبادل الرمز مع الديسكورد — حاول مجدداً.",
  user: "تعذر قراءة بيانات حسابك من الديسكورد.",
};

const Steps = ({ current }: { current: number }) => (
  <div className="flex items-center justify-center gap-3 mb-12 flex-wrap" data-testid="exam-steps">
    {["دخول الديسكورد", "الاجتياز", "منح الرتبة"].map((s, i) => (
      <div key={s} className="flex items-center gap-3">
        <div
          data-testid={`exam-step-${i}`}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold transition-colors ${
            i < current
              ? "border-[#009E49] bg-[#004D25]/40 text-[#4ADE80]"
              : i === current
                ? "border-[#D4AF37] bg-[#423204]/40 text-[#FDE047]"
                : "border-[#1E293B] text-[#64748B]"
          }`}
        >
          <span className="font-mono" dir="ltr">{i < current ? "✓" : i + 1}</span>
          {s}
        </div>
        {i < 2 && <span className="w-6 h-px bg-[#1E293B]" />}
      </div>
    ))}
  </div>
);

export default function Exam() {
  const qc = useQueryClient();
  const [params, setParams] = useSearchParams();
  const me = useQuery({
    queryKey: ["discord-me"],
    queryFn: () => apiGet<DiscordMember>("/discord/me"),
    retry: false,
  });
  const { data: questions, isError, refetch } = useQuery({
    queryKey: ["quiz-questions"],
    queryFn: () => apiGet<QuizQuestion[]>("/quiz/questions"),
    staleTime: Infinity,
    retry: false,
  });
  const [phase, setPhase] = useState<"intro" | "quiz" | "result">("intro");
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<{ id: number; option: string }[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    const d = params.get("discord");
    if (!d) return;
    if (d === "ok") toast.success("تم تسجيل الدخول عبر الديسكورد — ابدأ الاختبار الآن");
    else toast.error("لم يكتمل دخول الديسكورد", { description: FAIL_REASONS[params.get("reason") ?? ""] ?? "حاول مجدداً" });
    setParams({}, { replace: true });
  }, [params, setParams]);

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

  const retry = async () => {
    await refetch();
    start();
  };

  const logout = async () => {
    await apiPost("/discord/logout").catch(() => undefined);
    qc.removeQueries({ queryKey: ["discord-me"] });
    me.refetch();
  };

  const next = () => {
    if (selected === null || !questions) return;
    const nextAnswers = [...answers, { id: questions[idx].id, option: questions[idx].options[selected] }];
    if (idx + 1 === questions.length) {
      apiPost<QuizResult>("/quiz/submit", { answers: nextAnswers })
        .then((r) => {
          setResult(r);
          setPhase("result");
          if (!r.passed) setCooldown(60);
        })
        .catch((e) => {
          if (e instanceof ApiError && e.status === 401) {
            toast.error("انتهت جلسة الديسكورد — سجّل دخولك مجدداً");
            setPhase("intro");
            me.refetch();
          } else toast.error("تعذر تصحيح الاختبار — حاول مجدداً");
        });
    } else {
      setAnswers(nextAnswers);
      setIdx(idx + 1);
      setSelected(null);
    }
  };

  const q = questions?.[idx];
  const loggedIn = !!me.data;
  const step = phase === "result" && result?.passed ? 3 : loggedIn ? 1 : 0;

  return (
    <div className="pt-32 pb-24 min-h-screen" data-testid="exam-page">
      <div className="max-w-3xl mx-auto px-4">
        <Reveal>
          <p className="font-mono text-xs text-[#4ADE80] tracking-[0.3em] mb-3 text-center" dir="ltr">
            // POLICE ACADEMY — CAD TERMINAL
          </p>
          <h1 className="font-heading font-extrabold text-3xl lg:text-5xl text-white tracking-tight text-center mb-4">
            الاختبار الإلكتروني
          </h1>
          <p className="text-[#94A3B8] text-center mb-8 text-base">
            15 سؤالاً (اختيار من متعدد) — تحتاج 8 إجابات صحيحة فما فوق لاستلام رتبة {ACCEPTED_ROLE_NAME} تلقائياً.
          </p>
          <Steps current={step} />
        </Reveal>

        {isError ? (
          <div className="rounded-lg border border-[#1E293B] bg-[#0D141D] p-10 text-center text-[#94A3B8]" data-testid="exam-unavailable">
            الاختبار غير متاح حالياً — حاول لاحقاً.
          </div>
        ) : phase === "intro" ? (
          <Reveal delay={0.1}>
            <div className="gold-corners rounded-lg border border-[#1E293B] bg-[#0D141D] p-10 text-center scanlines relative" data-testid="exam-intro">
              {me.isLoading ? (
                <p className="text-[#64748B] text-sm" data-testid="exam-session-loading">جاري التحقق من جلسة الديسكورد...</p>
              ) : !loggedIn ? (
                <>
                  <SiDiscord size={52} className="text-[#5865F2] mx-auto mb-6" />
                  <h2 className="font-heading font-bold text-xl text-white mb-3">الخطوة الأولى: سجّل دخولك عبر الديسكورد</h2>
                  <p className="text-sm text-[#94A3B8] mb-8 max-w-md mx-auto leading-relaxed">
                    نحتاج حسابك في الديسكورد لنمنحك رتبة <span className="text-[#FDE047] font-bold">{ACCEPTED_ROLE_NAME}</span> تلقائياً
                    فور اجتيازك الاختبار. سيتم ضمّك لسيرفر BRQ إن لم تكن عضواً.
                  </p>
                  <a
                    href="/api/discord/login"
                    data-testid="exam-discord-login-btn"
                    className="inline-flex items-center gap-3 px-9 py-4 rounded-md bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold transition-colors"
                  >
                    <SiDiscord size={18} />
                    دخول عبر الديسكورد
                  </a>
                </>
              ) : (
                <>
                  <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-[#5865F2]/50 bg-[#5865F2]/10 mb-6" data-testid="exam-discord-user">
                    {me.data!.avatar ? (
                      <img src={me.data!.avatar} alt="" className="w-7 h-7 rounded-full" />
                    ) : (
                      <SiDiscord size={18} className="text-[#A5B4FC]" />
                    )}
                    <span className="text-sm text-white font-bold" data-testid="exam-discord-username">{me.data!.username}</span>
                    <button onClick={logout} data-testid="exam-discord-logout-btn" title="تبديل الحساب"
                      className="text-[#94A3B8] hover:text-white transition-colors">
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                  <ShieldCheck className="w-14 h-14 text-[#009E49] mx-auto mb-6" />
                  <h2 className="font-heading font-bold text-xl text-white mb-3">الخطوة الثانية: تعليمات الاختبار</h2>
                  <ul className="text-sm text-[#94A3B8] space-y-2 mb-8 max-w-md mx-auto text-right">
                    <li>· الأسئلة تغطي الرول بلاي، قواعد الاشتباك، والراديو والإجراءات الأمنية.</li>
                    <li>· تُخلط الأسئلة والخيارات تلقائياً عند كل محاولة.</li>
                    <li>· لا يمكن التراجع عن الإجابة بعد تأكيدها.</li>
                    <li>· عند الرسوب يمكنك إعادة المحاولة بعد 60 ثانية.</li>
                    <li>· عند الاجتياز تُمنح رتبة {ACCEPTED_ROLE_NAME} فوراً في الديسكورد.</li>
                  </ul>
                  <button
                    onClick={start}
                    disabled={!questions}
                    data-testid="exam-start-btn"
                    className="px-9 py-4 rounded-md bg-[#009E49] hover:bg-[#00b855] disabled:opacity-50 text-white font-bold transition-colors"
                  >
                    {questions ? "ابدأ الاختبار" : "جاري تحميل الأسئلة..."}
                  </button>
                </>
              )}
            </div>
          </Reveal>
        ) : phase === "quiz" && q ? (
          <div className="rounded-lg border border-[#1E293B] bg-[#0D141D] p-8 lg:p-10" data-testid="exam-quiz-panel">
            <div className="flex items-center justify-between mb-3 text-xs font-mono text-[#64748B]">
              <span data-testid="exam-progress-label">السؤال {idx + 1} / {questions!.length}</span>
              <span className="text-[#38BDF8]">اختيار من متعدد</span>
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
                    مبروك{me.data ? ` يا ${me.data.username}` : ""} — اجتزت الاختبار
                  </h2>
                  <p className="text-[#94A3B8] mb-5">
                    نتيجتك: <span className="text-[#4ADE80] font-bold font-mono" dir="ltr">{result.score}/{result.total}</span>
                  </p>
                  {result.role_granted ? (
                    <div className="inline-flex items-center gap-2 px-5 py-3 rounded-md border border-[#009E49]/50 bg-[#004D25]/40 text-sm text-[#4ADE80] mb-8" data-testid="exam-role-granted">
                      <CheckCircle2 className="w-5 h-5" />
                      تم منحك رتبة <span className="text-[#FDE047] font-bold">{ACCEPTED_ROLE_NAME}</span> في سيرفر الديسكورد
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-5 py-3 rounded-md border border-[#D4AF37]/50 bg-[#423204]/30 text-sm text-[#FDE047] mb-8" data-testid="exam-role-pending">
                      <AlertTriangle className="w-5 h-5" />
                      اجتزت الاختبار لكن تعذر منح الرتبة تلقائياً — تواصل مع الإدارة في الديسكورد.
                    </div>
                  )}
                  <div className="flex flex-wrap justify-center gap-4">
                    <a href={DISCORD_URL} target="_blank" rel="noreferrer" data-testid="exam-open-discord-btn"
                      className="inline-flex items-center gap-3 px-7 py-4 rounded-md bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold transition-colors">
                      <SiDiscord size={18} /> افتح الديسكورد
                    </a>
                    <Link to="/" data-testid="exam-home-link"
                      className="inline-flex items-center px-7 py-4 rounded-md border border-[#D4AF37]/60 text-[#FDE047] hover:bg-[#D4AF37]/10 font-bold transition-colors">
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
                    نتيجتك: <span className="text-[#F87171] font-bold font-mono" dir="ltr">{result.score}/{result.total}</span> — المطلوب 8/15
                  </p>
                  <p className="text-sm text-[#94A3B8] mb-8">
                    راجع <Link to="/rules" className="text-[#38BDF8] hover:underline">صفحة القوانين</Link> ثم أعد المحاولة.
                  </p>
                  <button
                    onClick={retry}
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
