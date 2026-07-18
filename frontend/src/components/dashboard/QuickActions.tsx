interface QuickActionsProps {
  actions: Array<{ id: string; title: string; description: string }>;
}

export const QuickActions = ({ actions }: QuickActionsProps) => {
  return (
    <section className="rounded-[28px] border border-emerald-800/40 bg-[#07120d] p-4 sm:p-5">
      <div className="mb-4">
        <p className="text-sm text-emerald-600">إجراءات سريعة</p>
        <h3 className="text-lg font-semibold text-[#f1fff4]">العمليات المتاحة</h3>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {actions.map((action) => (
          <button key={action.id} className="rounded-2xl border border-emerald-800/40 bg-[#09170f] p-3 text-right transition hover:border-emerald-500/40 hover:bg-[#102018]">
            <p className="font-medium text-[#f1fff4]">{action.title}</p>
            <p className="mt-1 text-sm text-[#7d977d]">{action.description}</p>
          </button>
        ))}
      </div>
    </section>
  );
};
