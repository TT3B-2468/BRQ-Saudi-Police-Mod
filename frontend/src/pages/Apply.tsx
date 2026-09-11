import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Send, FileText } from "lucide-react";
import { apiPost, ApiError } from "@/lib/api";
import { DIVISIONS } from "@/lib/config";
import { Reveal } from "@/components/Reveal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const initial = {
  full_name: "",
  discord_tag: "",
  age: "",
  fivem_hours: "",
  division: "",
  scenario_answer: "",
  agreed_rules: false,
};

export default function Apply() {
  const [form, setForm] = useState(initial);
  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const mutation = useMutation({
    mutationFn: () =>
      apiPost("/applications", {
        full_name: form.full_name.trim(),
        discord_tag: form.discord_tag.trim(),
        age: Number(form.age),
        fivem_hours: Number(form.fivem_hours),
        division: form.division,
        scenario_answer: form.scenario_answer.trim(),
        agreed_rules: form.agreed_rules,
      }),
    onSuccess: () => {
      toast.success("تم استلام طلبك بنجاح", { description: "ستتواصل معك الإدارة عبر الديسكورد خلال 72 ساعة." });
      setForm(initial);
    },
    onError: (e) => {
      const msg =
        e instanceof ApiError && e.status === 422
          ? "تأكد من تعبئة جميع الحقول بشكل صحيح (تحليل الموقف 20 حرفاً على الأقل)."
          : "تعذر إرسال الطلب — حاول لاحقاً.";
      toast.error(msg);
    },
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.agreed_rules) {
      toast.error("يجب الموافقة على القوانين قبل الإرسال");
      return;
    }
    mutation.mutate();
  };

  const fieldCls =
    "bg-[#0A1017] border-[#273549] text-white placeholder:text-[#475569] focus-visible:ring-[#009E49]";

  return (
    <div className="pt-32 pb-24 min-h-screen" data-testid="apply-page">
      <div className="max-w-3xl mx-auto px-4">
        <Reveal>
          <div className="flex items-center gap-4 mb-4">
            <FileText className="w-8 h-8 text-[#009E49]" />
            <p className="font-mono text-xs text-[#D4AF37] tracking-[0.3em]" dir="ltr">// RECRUITMENT TERMINAL</p>
          </div>
          <h1 className="font-heading font-extrabold text-3xl lg:text-5xl text-white tracking-tight mb-4">
            نموذج التقديم الرسمي
          </h1>
          <p className="text-[#94A3B8] mb-12 text-base leading-relaxed">
            يُفضّل اجتياز الاختبار الإلكتروني أولاً — الطلبات المكتملة تُراجع خلال 72 ساعة.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <form
            onSubmit={submit}
            className="gold-corners rounded-lg border border-[#1E293B] bg-[#0D141D] p-8 lg:p-10 space-y-7 scanlines relative"
            data-testid="apply-form"
          >
            <div className="grid gap-7 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-[#CBD5E1]">الاسم الكامل</Label>
                <Input id="full_name" data-testid="apply-name-input" required minLength={3}
                  value={form.full_name} onChange={(e) => set("full_name", e.target.value)}
                  placeholder="مثال: عبدالله الحربي" className={fieldCls} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discord_tag" className="text-[#CBD5E1]">حساب الديسكورد</Label>
                <Input id="discord_tag" data-testid="apply-discord-input" required minLength={2}
                  value={form.discord_tag} onChange={(e) => set("discord_tag", e.target.value)}
                  placeholder="username" dir="ltr" className={`${fieldCls} text-left`} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age" className="text-[#CBD5E1]">العمر</Label>
                <Input id="age" type="number" data-testid="apply-age-input" required min={13} max={99}
                  value={form.age} onChange={(e) => set("age", e.target.value)}
                  placeholder="18" className={fieldCls} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fivem_hours" className="text-[#CBD5E1]">ساعات خبرتك في FiveM</Label>
                <Input id="fivem_hours" type="number" data-testid="apply-hours-input" required min={0}
                  value={form.fivem_hours} onChange={(e) => set("fivem_hours", e.target.value)}
                  placeholder="500" className={fieldCls} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[#CBD5E1]">الإدارة المطلوبة</Label>
              <Select value={form.division} onValueChange={(v: string) => set("division", v)}>
                <SelectTrigger data-testid="apply-division-select" className="bg-[#0A1017] border-[#273549] text-white w-full">
                  <SelectValue placeholder="اختر الإدارة">{(v) => v as string}</SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-[#0D141D] border-[#273549]">
                  {DIVISIONS.map((d) => (
                    <SelectItem key={d} value={d} data-testid={`apply-division-${d}`} className="text-[#CBD5E1]">
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scenario" className="text-[#CBD5E1]">
                تحليل موقف: أثناء دوريتك لاحظت مركبة مسرعة تجاوزت إشارة حمراء — ماذا تفعل خطوة بخطوة؟
              </Label>
              <Textarea id="scenario" data-testid="apply-scenario-input" required minLength={20} rows={5}
                value={form.scenario_answer} onChange={(e) => set("scenario_answer", e.target.value)}
                placeholder="اكتب تصرفك كضابط وفق البروتوكول: البلاغ للعمليات، المتابعة الآمنة، الإيقاف..." 
                className={fieldCls} />
            </div>

            <label className="flex items-start gap-3 cursor-pointer" data-testid="apply-agree-wrapper">
              <Checkbox
                checked={form.agreed_rules}
                onCheckedChange={(c) => set("agreed_rules", c === true)}
                data-testid="apply-agree-checkbox"
                className="mt-0.5 border-[#273549] data-[checked]:bg-[#009E49] data-[checked]:border-[#009E49]"
              />
              <span className="text-sm text-[#94A3B8] leading-relaxed">
                أقر بأنني اطلعت على قوانين سيرفر BRQ وأوافق على الالتزام الكامل بها، وأن جميع البيانات المدخلة صحيحة.
              </span>
            </label>

            <button
              type="submit"
              disabled={mutation.isPending}
              data-testid="apply-submit-btn"
              className="w-full inline-flex items-center justify-center gap-3 py-4 rounded-md bg-[#009E49] hover:bg-[#00b855] disabled:opacity-50 text-white font-bold transition-colors"
            >
              <Send className="w-4 h-4" />
              {mutation.isPending ? "جاري الإرسال..." : "إرسال طلب الالتحاق"}
            </button>
          </form>
        </Reveal>
      </div>
    </div>
  );
}
