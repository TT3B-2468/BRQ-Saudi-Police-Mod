import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowLeft, Pin } from "lucide-react";
import { apiGet } from "@/lib/api";
import type { NewsPost } from "@/lib/types";
import { Reveal } from "@/components/Reveal";

export const NewsPreview = () => {
  const { data, isError } = useQuery({
    queryKey: ["news", "preview"],
    queryFn: () => apiGet<NewsPost[]>("/news"),
    retry: false,
  });
  const posts = (data ?? []).slice(0, 3);

  return (
    <section className="py-24 lg:py-32" data-testid="news-preview-section">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <Reveal>
          <div className="flex items-end justify-between mb-14 flex-wrap gap-4">
            <div>
              <p className="font-mono text-xs text-[#38BDF8] tracking-[0.3em] mb-3" dir="ltr">// DISPATCH FEED</p>
              <h2 className="font-heading font-extrabold text-3xl lg:text-5xl text-white tracking-tight">
                آخر البلاغات والأخبار
              </h2>
            </div>
            <Link
              to="/news"
              data-testid="news-preview-all-link"
              className="inline-flex items-center gap-2 text-sm text-[#FDE047] hover:gap-3 transition-all"
            >
              جميع الأخبار
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </Reveal>

        {isError || posts.length === 0 ? (
          <div className="rounded-lg border border-[#1E293B] bg-[#0D141D] p-10 text-center text-[#94A3B8] text-sm" data-testid="news-preview-empty">
            لا توجد بلاغات منشورة حالياً — تابعنا على الديسكورد لآخر المستجدات.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {posts.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.1}>
                <article
                  data-testid={`news-preview-card-${p.id}`}
                  className="tactical-card h-full rounded-lg border border-[#1E293B] bg-[#0D141D] p-7 flex flex-col"
                >
                  <div className="flex items-center gap-2 mb-4">
                    {p.pinned && <Pin className="w-3.5 h-3.5 text-[#D4AF37]" />}
                    <span className="text-[11px] px-2.5 py-1 rounded-full bg-[#0F2847] text-[#60A5FA] border border-[#1E40AF]/40">
                      {p.category}
                    </span>
                    <span className="text-[11px] text-[#64748B] font-mono mr-auto" dir="ltr">
                      {new Date(p.created_at).toLocaleDateString("ar-SA")}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-lg text-white mb-3 leading-snug">{p.title}</h3>
                  <p className="text-sm text-[#94A3B8] leading-relaxed line-clamp-3">{p.content}</p>
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
