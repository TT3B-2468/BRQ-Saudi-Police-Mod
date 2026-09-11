import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { LogOut, Trash2, CheckCircle2, XCircle, Pin } from "lucide-react";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import type { AdminUser, Application, NewsPost } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUS_LABELS: Record<string, string> = { pending: "قيد المراجعة", accepted: "مقبول", rejected: "مرفوض" };
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-[#423204] text-[#FDE047] border-[#D4AF37]/40",
  accepted: "bg-[#004D25] text-[#4ADE80] border-[#009E49]/40",
  rejected: "bg-[#2A0D0D] text-[#F87171] border-[#DC2626]/40",
};
const NEWS_CATEGORIES = ["بيان أمني", "تحديث السيرفر", "ترقيات", "فعاليات"];

export default function Admin() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const me = useQuery({ queryKey: ["admin-me"], queryFn: () => apiGet<AdminUser>("/auth/me"), retry: false });

  const [statusFilter, setStatusFilter] = useState("");
  const apps = useQuery({
    queryKey: ["admin-apps", statusFilter],
    queryFn: () => apiGet<Application[]>(`/admin/applications${statusFilter ? `?status=${statusFilter}` : ""}`),
    enabled: !!me.data,
  });
  const news = useQuery({
    queryKey: ["admin-news"],
    queryFn: () => apiGet<NewsPost[]>("/news"),
    enabled: !!me.data,
  });

  const [decision, setDecision] = useState<{ app: Application; status: "accepted" | "rejected" } | null>(null);
  const [note, setNote] = useState("");
  const [newsForm, setNewsForm] = useState({ title: "", category: "بيان أمني", content: "", pinned: false });

  useEffect(() => {
    if (me.isError) navigate("/admin/login", { replace: true });
  }, [me.isError, navigate]);

  const decideMut = useMutation({
    mutationFn: () => apiPatch(`/admin/applications/${decision!.app.id}`, { status: decision!.status, note }),
    onSuccess: () => {
      toast.success("تم تحديث حالة الطلب");
      setDecision(null);
      setNote("");
      qc.invalidateQueries({ queryKey: ["admin-apps"] });
    },
    onError: () => toast.error("تعذر تحديث الطلب"),
  });

  const createNewsMut = useMutation({
    mutationFn: () => apiPost("/admin/news", newsForm),
    onSuccess: () => {
      toast.success("تم نشر البلاغ");
      setNewsForm({ title: "", category: "بيان أمني", content: "", pinned: false });
      qc.invalidateQueries({ queryKey: ["admin-news"] });
      qc.invalidateQueries({ queryKey: ["news"] });
    },
    onError: () => toast.error("تعذر نشر البلاغ"),
  });

  const deleteNewsMut = useMutation({
    mutationFn: (id: string) => apiDelete(`/admin/news/${id}`),
    onSuccess: () => {
      toast.success("تم حذف البلاغ");
      qc.invalidateQueries({ queryKey: ["admin-news"] });
      qc.invalidateQueries({ queryKey: ["news"] });
    },
    onError: () => toast.error("تعذر حذف البلاغ"),
  });

  const logout = async () => {
    await apiPost("/auth/logout").catch(() => undefined);
    qc.clear();
    navigate("/admin/login");
  };

  if (me.isLoading || me.isError) {
    return <div className="pt-40 text-center text-[#64748B]" data-testid="admin-loading">جاري التحقق من الجلسة...</div>;
  }

  return (
    <div className="pt-32 pb-24 min-h-screen" data-testid="admin-dashboard">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
          <div>
            <p className="font-mono text-xs text-[#D4AF37] tracking-[0.3em] mb-2" dir="ltr">// COMMAND & CONTROL</p>
            <h1 className="font-heading font-extrabold text-3xl text-white">لوحة إدارة BRQ</h1>
            <p className="text-xs text-[#64748B] mt-1 font-mono" dir="ltr">{me.data!.email}</p>
          </div>
          <button
            onClick={logout}
            data-testid="admin-logout-btn"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md border border-[#DC2626]/40 text-[#F87171] hover:bg-[#2A0D0D]/40 text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" /> تسجيل الخروج
          </button>
        </div>

        <Tabs defaultValue="applications">
          <TabsList className="bg-[#0D141D] border border-[#1E293B] mb-8">
            <TabsTrigger value="applications" data-testid="tab-applications">
              طلبات التقديم ({apps.data?.length ?? 0})
            </TabsTrigger>
            <TabsTrigger value="news" data-testid="tab-news">
              إدارة الأخبار ({news.data?.length ?? 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="applications">
            <div className="flex flex-wrap gap-2 mb-6" data-testid="admin-status-filters">
              {["", "pending", "accepted", "rejected"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  data-testid={`admin-filter-${s || "all"}`}
                  className={`px-4 py-2 rounded-full text-xs border transition-colors ${
                    statusFilter === s
                      ? "border-[#009E49] bg-[#004D25]/30 text-[#4ADE80]"
                      : "border-[#1E293B] text-[#94A3B8] hover:text-white"
                  }`}
                >
                  {s === "" ? "الكل" : STATUS_LABELS[s]}
                </button>
              ))}
            </div>
            {!apps.data || apps.data.length === 0 ? (
              <div className="rounded-lg border border-[#1E293B] bg-[#0D141D] p-10 text-center text-[#94A3B8] text-sm" data-testid="admin-apps-empty">
                لا توجد طلبات تقديم حالياً.
              </div>
            ) : (
              <div className="space-y-4">
                {apps.data.map((a) => (
                  <div key={a.id} data-testid={`admin-app-${a.id}`}
                    className="rounded-lg border border-[#1E293B] bg-[#0D141D] p-6">
                    <div className="flex items-start justify-between flex-wrap gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="font-heading font-bold text-white">{a.full_name}</h3>
                          <span className={`text-[11px] px-2.5 py-1 rounded-full border ${STATUS_COLORS[a.status]}`}
                            data-testid={`admin-app-status-${a.id}`}>
                            {STATUS_LABELS[a.status]}
                          </span>
                        </div>
                        <div className="text-xs text-[#94A3B8] space-y-1 font-mono">
                          <p>ديسكورد: <span dir="ltr" className="text-[#38BDF8]">{a.discord_tag}</span></p>
                          <p>العمر: {a.age} · خبرة FiveM: {a.fivem_hours} ساعة · الإدارة: {a.division}</p>
                        </div>
                        <p className="text-sm text-[#CBD5E1] mt-3 leading-relaxed bg-[#0A1017] rounded-md p-4 border border-[#1E293B]">
                          {a.scenario_answer}
                        </p>
                        {a.note && <p className="text-xs text-[#FDE047] mt-2">ملاحظة الإدارة: {a.note}</p>}
                      </div>
                      {a.status === "pending" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => setDecision({ app: a, status: "accepted" })}
                            data-testid={`admin-accept-${a.id}`}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#004D25] border border-[#009E49]/50 text-[#4ADE80] text-xs font-bold hover:bg-[#009E49]/20 transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4" /> قبول
                          </button>
                          <button
                            onClick={() => setDecision({ app: a, status: "rejected" })}
                            data-testid={`admin-reject-${a.id}`}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#2A0D0D] border border-[#DC2626]/40 text-[#F87171] text-xs font-bold hover:bg-[#DC2626]/15 transition-colors"
                          >
                            <XCircle className="w-4 h-4" /> رفض
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="news">
            <form
              onSubmit={(e) => { e.preventDefault(); createNewsMut.mutate(); }}
              className="rounded-lg border border-[#1E293B] bg-[#0D141D] p-7 space-y-5 mb-10"
              data-testid="admin-news-form"
            >
              <h3 className="font-heading font-bold text-white">نشر بلاغ جديد</h3>
              <div className="grid gap-5 sm:grid-cols-2">
                <Input required minLength={3} placeholder="عنوان البلاغ" data-testid="admin-news-title"
                  value={newsForm.title} onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                  className="bg-[#0A1017] border-[#273549] text-white" />
                <Select value={newsForm.category} onValueChange={(v: string) => setNewsForm({ ...newsForm, category: v })}>
                  <SelectTrigger data-testid="admin-news-category" className="bg-[#0A1017] border-[#273549] text-white">
                    <SelectValue>{(v) => v as string}</SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-[#0D141D] border-[#273549]">
                    {NEWS_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c} className="text-[#CBD5E1]">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Textarea required minLength={10} rows={4} placeholder="نص البلاغ..." data-testid="admin-news-content"
                value={newsForm.content} onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                className="bg-[#0A1017] border-[#273549] text-white" />
              <label className="flex items-center gap-2 text-sm text-[#94A3B8] cursor-pointer">
                <Checkbox checked={newsForm.pinned} data-testid="admin-news-pinned"
                  onCheckedChange={(c) => setNewsForm({ ...newsForm, pinned: c === true })}
                  className="border-[#273549] data-[checked]:bg-[#D4AF37] data-[checked]:border-[#D4AF37]" />
                تثبيت البلاغ أعلى القائمة
              </label>
              <button type="submit" disabled={createNewsMut.isPending} data-testid="admin-news-submit"
                className="px-7 py-3 rounded-md bg-[#009E49] hover:bg-[#00b855] disabled:opacity-50 text-white text-sm font-bold transition-colors">
                {createNewsMut.isPending ? "جاري النشر..." : "نشر البلاغ"}
              </button>
            </form>

            <div className="space-y-3">
              {(news.data ?? []).map((p) => (
                <div key={p.id} data-testid={`admin-news-item-${p.id}`}
                  className="flex items-center justify-between gap-4 rounded-lg border border-[#1E293B] bg-[#0D141D] px-6 py-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {p.pinned && <Pin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />}
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">{p.title}</p>
                      <p className="text-[11px] text-[#64748B] font-mono">{p.category}</p>
                    </div>
                  </div>
                  <button onClick={() => deleteNewsMut.mutate(p.id)} data-testid={`admin-news-delete-${p.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-[#F87171] hover:bg-[#2A0D0D]/50 text-xs transition-colors shrink-0">
                    <Trash2 className="w-4 h-4" /> حذف
                  </button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!decision} onOpenChange={(o) => !o && setDecision(null)}>
        <DialogContent className="bg-[#0D141D] border-[#1E293B]" data-testid="admin-decision-dialog">
          <DialogHeader>
            <DialogTitle className="text-white">
              {decision?.status === "accepted" ? "قبول طلب" : "رفض طلب"} — {decision?.app.full_name}
            </DialogTitle>
          </DialogHeader>
          <Textarea rows={3} placeholder="ملاحظة للمتقدم (اختياري)..." data-testid="admin-decision-note"
            value={note} onChange={(e) => setNote(e.target.value)}
            className="bg-[#0A1017] border-[#273549] text-white" />
          <button
            onClick={() => decideMut.mutate()}
            disabled={decideMut.isPending}
            data-testid="admin-decision-confirm"
            className={`w-full py-3 rounded-md text-white font-bold text-sm transition-colors disabled:opacity-50 ${
              decision?.status === "accepted" ? "bg-[#009E49] hover:bg-[#00b855]" : "bg-[#DC2626] hover:bg-[#b91c1c]"
            }`}
          >
            تأكيد {decision?.status === "accepted" ? "القبول" : "الرفض"}
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
