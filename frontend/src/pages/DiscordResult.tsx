import { Link, useSearchParams } from "react-router-dom";
import { ShieldCheck, ShieldX } from "lucide-react";
import { SiDiscord } from "@icons-pack/react-simple-icons";
import { ACCEPTED_ROLE_NAME, DISCORD_URL } from "@/lib/config";
import { Reveal } from "@/components/Reveal";

const REASONS: Record<string, string> = {
  config: "ربط الديسكورد غير مفعّل بعد — تواصل مع الإدارة لاستلام رتبتك يدوياً.",
  state: "انتهت صلاحية رمز الاجتياز — أعد الاختبار الإلكتروني وحاول مجدداً.",
  denied: "تم إلغاء تسجيل الدخول من الديسكورد.",
  token: "فشل تبادل الرمز مع الديسكورد — حاول مجدداً.",
  user: "تعذر قراءة بيانات حسابك من الديسكورد.",
  role: "تم تسجيل دخولك لكن تعذر منح الرتبة — تأكد أن البوت موجود في السيرفر أو تواصل مع الإدارة.",
};

export default function DiscordResult() {
  const [params] = useSearchParams();
  const status = params.get("status");
  const user = params.get("user");
  const reason = params.get("reason") ?? "";
  const success = status === "success";

  return (
    <div className="pt-32 pb-24 min-h-screen flex items-start justify-center" data-testid="discord-result-page">
      <Reveal className="w-full max-w-lg mx-4">
        <div
          className={`gold-corners rounded-lg border p-10 text-center scanlines relative ${
            success ? "border-[#009E49]/50 bg-[#004D25]/15" : "border-[#DC2626]/40 bg-[#2A0D0D]/25"
          }`}
          data-testid="discord-result-panel"
        >
          {success ? (
            <>
              <ShieldCheck className="w-16 h-16 text-[#4ADE80] mx-auto mb-5" />
              <h1 className="font-heading font-extrabold text-2xl text-white mb-3" data-testid="discord-result-title">
                أهلاً بك في القوة{user ? ` يا ${user}` : ""}
              </h1>
              <p className="text-sm text-[#94A3B8] leading-relaxed mb-8">
                تم ربط حسابك ومنحك رتبة <span className="text-[#FDE047] font-bold">{ACCEPTED_ROLE_NAME}</span> في
                سيرفر الديسكورد بنجاح. توجه الآن إلى السيرفر والتحق بالدوريات — بانتظارك في الميدان.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link to="/" data-testid="discord-result-home-btn"
                  className="px-7 py-3.5 rounded-md bg-[#009E49] hover:bg-[#00b855] text-white font-bold text-sm transition-colors">
                  العودة للرئيسية
                </Link>
                <a href={DISCORD_URL} target="_blank" rel="noreferrer" data-testid="discord-result-open-btn"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-md border border-[#5865F2] text-[#A5B4FC] hover:bg-[#5865F2]/15 font-bold text-sm transition-colors">
                  <SiDiscord size={16} /> افتح الديسكورد
                </a>
              </div>
            </>
          ) : (
            <>
              <ShieldX className="w-16 h-16 text-[#DC2626] mx-auto mb-5" />
              <h1 className="font-heading font-extrabold text-2xl text-white mb-3" data-testid="discord-result-title">
                لم يكتمل ربط الديسكورد
              </h1>
              <p className="text-sm text-[#94A3B8] leading-relaxed mb-8" data-testid="discord-result-reason">
                {REASONS[reason] ?? "حدث خطأ غير متوقع — حاول مجدداً."}
              </p>
              <Link to="/exam" data-testid="discord-result-retry-btn"
                className="inline-block px-7 py-3.5 rounded-md bg-[#009E49] hover:bg-[#00b855] text-white font-bold text-sm transition-colors">
                العودة للاختبار
              </Link>
            </>
          )}
        </div>
      </Reveal>
    </div>
  );
}
