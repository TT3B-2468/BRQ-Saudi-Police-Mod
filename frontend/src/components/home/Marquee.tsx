const items = [
  "دوريات الأمن العام",
  "الإدارة العامة للمرور",
  "القوات الخاصة للأمن الدبلوماسي",
  "البحث الجنائي",
  "جناح الطيران الأمني",
  "سيرفر BRQ للحياة الواقعية السعودية",
  "نظام تدريب عالي الواقعية",
  "لوحة تحكم ذكية للأعضاء",
];

export const Marquee = () => (
  <div dir="ltr" className="overflow-hidden border-y border-[#1E293B] bg-[#0A1017] py-3" data-testid="tactical-marquee">
    <div className="marquee-track flex w-max">
      {[...items, ...items].map((t, i) => (
        <span key={i} className="flex items-center text-sm text-[#94A3B8] font-mono tracking-wider whitespace-nowrap">
          <span className="mx-8 text-[#D4AF37]">//</span>
          {t}
        </span>
      ))}
    </div>
  </div>
);
