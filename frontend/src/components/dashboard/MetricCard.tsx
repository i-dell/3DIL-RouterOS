interface MetricCardProps {
  label: string;
  value: string;
  status: string;
  progress?: number;
}

export const MetricCard = ({ label, value, status, progress }: MetricCardProps) => {
  return (
    <div className="rounded-[24px] border border-emerald-800/40 bg-[#07120d] p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#7d977d]">{label}</p>
        <span className="rounded-full border border-emerald-800/50 px-2 py-1 text-[10px] text-emerald-400">{status}</span>
      </div>
      <p className="mt-4 text-2xl font-semibold text-[#f1fff4]">{value}</p>
      {typeof progress === 'number' ? (
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#112118]">
          <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
        </div>
      ) : null}
    </div>
  );
};
