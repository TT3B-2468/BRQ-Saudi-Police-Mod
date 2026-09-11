import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Pin, Newspaper } from "lucide-react";
import { apiGet } from "@/lib/api";
import type { NewsPost } from "@/lib/types";
import { Reveal } from "@/components/Reveal";

const CATEGORIES = ["الكل", "بيان أمني", "تحديث السيرفر", "ترقيات", "فعاليات"];

export default function NewsPage() {
  const [filter, setFilter] = useState("الكل");
  const { data, isError, isLoading } = useQuery({
    queryKey: ["news", "all"],
    queryFn: () => apiGet<NewsPost[]>("/news"),
    retry: false,
  });
  const posts = (data ?? []).filter((p) => filter === "الكل" || p.category === filter);

  return (
    <div className="pt-32 pb-24 min-h-screen" data-testid="news-page">
      <div className="max-w-5xl mx-auto px-4">
        <Reveal>
          <div className="flex items-center gap-4 mb-4">
            <Newspaper className="w-8 h-8 text-[#38BDF8]" />
            <p className="font-mono text-xs text-[#4ADE80] tracking-[0.3em]" dir="ltr">// INTELLIGENCE DISPATCH</p>
          </div>
          <h1 className="font-heading font-extrabold text-3xl lg:text-5xl text-white tracking-tight mb-4">
            البلاغات والأخبار
          </h1>
          <p className="text-[#94A3B8] mb-10 text-base">بيانات رسمية، تحديثات، وفعاليات سيرفر BRQ.</p>
        </Reveal>

        <div className="flex flex-wrap gap-2 mb-10" data-testid="news-filters">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              data-testid={`news-filter-${c}`}
              className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                filter === c
                  ? "border-[#009E49] bg-[#004D25]/30 text-[#4ADE80]"
                  : "border-[#1E293B] bg-[#0A1017] text-[#94A3B8] hover:text-white"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {isLoading ? (
          <p className="text-[#64748B] text-sm">جاري تحميل البلاغات...</p>
        ) : isError || posts.length === 0 ? (
          <div className="rounded-lg border border-[#1E293B] bg-[#0D141D] p-10 text-center text-[#94A3B8] text-sm" data-testid="news-empty">
            لا توجد بلاغات في هذا التصنيف حالياً.
          </div>
        ) : (
          <div className="space-y-5">
            {posts.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.06}>
                <article
                  data-testid={`news-card-${p.id}`}
                  className={`tactical-card rounded-lg border bg-[#0D141D] p-7 ${
                    p.pinned ? "border-[#D4AF37]/40" : "border-[#1E293B]"
                  }`}
                >
                  <div className="flex items-center flex-wrap gap-3 mb-3">
                    {p.pinned && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#FDE047]">
                        <Pin className="w-3.5 h-3.5" /> مثبت
                      </span>
                    )}
                    <span className="text-[11px] px-2.5 py-1 rounded-full bg-[#0F2847] text-[#60A5FA] border border-[#1E40AF]/40">
                      {p.category}
                    </span>
                    <span className="text-[11px] text-[#64748B] font-mono mr-auto" dir="ltr">
                      {new Date(p.created_at).toLocaleDateString("ar-SA")} · {p.author}
                    </span>
                  </div>
                  <h2 className="font-heading font-bold text-xl text-white mb-3 leading-snug">{p.title}</h2>
                  <p className="text-sm text-[#94A3B8] leading-relaxed">{p.content}</p>
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
