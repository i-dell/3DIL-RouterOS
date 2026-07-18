interface ActivityItem {
  id: string;
  title: string;
  detail: string;
  when: string;
}

interface ActivityFeedProps {
  items: ActivityItem[];
}

export const ActivityFeed = ({ items }: ActivityFeedProps) => {
  return (
    <section className="rounded-[28px] border border-emerald-800/40 bg-[linear-gradient(180deg,_rgba(7,18,13,0.95),_rgba(4,12,9,0.95))] p-4 sm:p-5">
      <div className="mb-4">
        <p className="text-sm text-emerald-600">النشاط الأخير</p>
        <h3 className="text-lg font-semibold text-[#f1fff4]">سجل الشبكة</h3>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-emerald-900/50 bg-[#09170f] p-3 transition duration-200 hover:border-emerald-500/40">
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium text-[#f1fff4]">{item.title}</p>
              <span className="text-xs text-emerald-500">{item.when}</span>
            </div>
            <p className="mt-1 text-sm text-[#7d977d]">{item.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
