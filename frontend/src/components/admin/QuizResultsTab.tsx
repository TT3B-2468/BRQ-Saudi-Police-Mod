import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Award, XCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import { SiDiscord } from "@icons-pack/react-simple-icons";
import { apiGet } from "@/lib/api";
import type { QuizAttempt } from "@/lib/types";
import { ACCEPTED_ROLE_NAME } from "@/lib/config";

const FILTERS = [
  { key: "passed", label: "المجتازون", q: "?passed=true" },
  { key: "failed", label: "الراسبون", q: "?passed=false" },
  { key: "all", label: "الكل", q: "" },
];

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("ar-SA", { dateStyle: "medium", timeStyle: "short" });

export const QuizResultsTab = () => {
  const [filter, setFilter] = useState("passed");
  const q = FILTERS.find((f) => f.key === filter)!.q;
  const results = useQuery({
    queryKey: ["admin-quiz-results", filter],
    queryFn: () => apiGet<QuizAttempt[]>(`/admin/quiz-results${q}`),
  });

  return (
    <div data-testid="admin-quiz-results">
      <div className="flex flex-wrap gap-2 mb-6" data-testid="admin-quiz-filters">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            data-testid={`admin-quiz-filter-${f.key}`}
            className={`px-4 py-2 rounded-full text-xs border transition-colors ${
              filter === f.key
                ? "border-[#009E49] bg-[#004D25]/30 text-[#4ADE80]"
                : "border-[#1E293B] text-[#94A3B8] hover:text-white"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {results.isLoading ? (
        <div className="text-center text-[#64748B] text-sm py-10">جاري التحميل...</div>
      ) : !results.data || results.data.length === 0 ? (
        <div className="rounded-lg border border-[#1E293B] bg-[#0D141D] p-10 text-center text-[#94A3B8] text-sm" data-testid="admin-quiz-empty">
          لا توجد محاولات مسجلة حتى الآن.
        </div>
      ) : (
        <div className="rounded-lg border border-[#1E293B] bg-[#0D141D] overflow-hidden">
          <table className="w-full text-sm" data-testid="admin-quiz-table">
            <thead className="bg-[#0A1017] text-[#94A3B8] text-xs">
              <tr>
                <th className="text-right px-5 py-3 font-bold">العضو</th>
                <th className="text-right px-5 py-3 font-bold">الدرجة</th>
                <th className="text-right px-5 py-3 font-bold">النتيجة</th>
                <th className="text-right px-5 py-3 font-bold">الرتبة</th>
                <th className="text-right px-5 py-3 font-bold">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {results.data.map((r) => (
                <tr key={r.id} data-testid={`admin-quiz-row-${r.id}`} className="border-t border-[#1E293B] hover:bg-[#111B27]/60 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {r.avatar ? (
                        <img src={r.avatar} alt="" className="w-8 h-8 rounded-full" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#5865F2]/20 flex items-center justify-center">
                          <SiDiscord size={14} className="text-[#A5B4FC]" />
                        </div>
                      )}
                      <div>
                        <div className="text-white font-bold" data-testid={`admin-quiz-username-${r.id}`}>{r.username}</div>
                        <div className="text-[10px] text-[#64748B] font-mono" dir="ltr">{r.user_id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-mono font-bold text-[#FDE047]" dir="ltr" data-testid={`admin-quiz-score-${r.id}`}>
                    {r.score}/{r.total}
                  </td>
                  <td className="px-5 py-3">
                    {r.passed ? (
                      <span className="inline-flex items-center gap-1.5 text-[#4ADE80] text-xs font-bold"><Award className="w-4 h-4" /> مجتاز</span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[#F87171] text-xs font-bold"><XCircle className="w-4 h-4" /> راسب</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-xs">
                    {r.role_granted ? (
                      <span className="inline-flex items-center gap-1.5 text-[#4ADE80]"><CheckCircle2 className="w-4 h-4" /> {ACCEPTED_ROLE_NAME}</span>
                    ) : r.passed ? (
                      <span className="inline-flex items-center gap-1.5 text-[#FDE047]"><AlertTriangle className="w-4 h-4" /> لم تُمنح</span>
                    ) : (
                      <span className="text-[#64748B]">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-xs text-[#94A3B8] whitespace-nowrap">{fmt(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
