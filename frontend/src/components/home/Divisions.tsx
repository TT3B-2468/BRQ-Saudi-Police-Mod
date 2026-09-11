import { Reveal } from "@/components/Reveal";
import { IMAGES } from "@/lib/config";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const divisions = [
  {
    id: "security-patrols",
    num: "01",
    title: "دوريات الأمن العام",
    desc: "العمود الفقري للسيرفر — استجابة للبلاغات، انتشار ميداني، وحضور أمني على مدار الساعة.",
    img: IMAGES.patrol,
  },
  {
    id: "traffic",
    num: "02",
    title: "الإدارة العامة للمرور",
    desc: "ضبط الحركة، معالجة الحوادث، ومطاردات السرعة برادارات ومحاكاة واقعية.",
    img: IMAGES.city,
  },
  {
    id: "investigations",
    num: "03",
    title: "البحث الجنائي",
    desc: "تحقيقات سرية، جمع أدلة، وتفكيك شبكات الجريمة المنظمة داخل المدينة.",
    img: IMAGES.officer,
  },
  {
    id: "special-forces",
    num: "04",
    title: "القوات الخاصة",
    desc: "عمليات اقتحام عالية الخطورة، تحرير رهائن، وتدخل سريع — للنخبة فقط.",
    img: IMAGES.forces,
  },
];

export const Divisions = () => (
  <section className="py-24 lg:py-32" data-testid="divisions-section">
    <div className="max-w-7xl mx-auto px-4 lg:px-8">
      <Reveal>
        <div className="flex items-end justify-between mb-14 flex-wrap gap-4">
          <div>
            <p className="font-mono text-xs text-[#4ADE80] tracking-[0.3em] mb-3" dir="ltr">// BRQ DIVISIONS</p>
            <h2 className="font-heading font-extrabold text-3xl lg:text-5xl text-white tracking-tight">
              القطاعات الأمنية الأربع
            </h2>
          </div>
          <Link
            to="/apply"
            data-testid="divisions-apply-link"
            className="inline-flex items-center gap-2 text-sm text-[#FDE047] hover:gap-3 transition-all"
          >
            قدّم على إحداها الآن
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </Reveal>

      <div className="grid gap-6 md:grid-cols-2">
        {divisions.map((d, i) => (
          <Reveal key={d.id} delay={i * 0.1}>
            <article
              data-testid={`division-card-${d.id}`}
              className="tactical-card gold-corners group relative h-80 rounded-lg overflow-hidden border border-[#1E293B] bg-[#0D141D]"
            >
              <img
                src={d.img}
                alt={d.title}
                className="absolute inset-0 w-full h-full object-cover opacity-45 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#060A0E] via-[#060A0E]/50 to-transparent" />
              <div className="relative h-full flex flex-col justify-end p-7">
                <span className="font-mono text-[#D4AF37] text-sm mb-2" dir="ltr">{d.num}</span>
                <h3 className="font-heading font-bold text-2xl text-white mb-2">{d.title}</h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed max-w-md">{d.desc}</p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);
