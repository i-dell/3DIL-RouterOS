import { useMemo, useState } from 'react';
import { RouterHero } from '../components/dashboard/RouterHero.js';
import { MetricCard } from '../components/dashboard/MetricCard.js';
import { ConnectedDevices } from '../components/dashboard/ConnectedDevices.js';
import { QuickActions } from '../components/dashboard/QuickActions.js';
import { ActivityFeed } from '../components/dashboard/ActivityFeed.js';
import { fallbackDashboardData } from '../data/dashboardData.js';

export const DashboardPage = () => {
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);
  const snapshot = fallbackDashboardData;

  const content = useMemo(() => {
    if (loading) {
      return <div className="rounded-[28px] border border-emerald-800/40 bg-[#07120d] p-6 text-emerald-200">جارٍ تحميل لوحة التحكم…</div>;
    }

    if (error) {
      return <div className="rounded-[28px] border border-emerald-800/40 bg-[#07120d] p-6 text-emerald-200">{error}</div>;
    }

    return (
      <div className="space-y-4">
        <RouterHero data={snapshot.hero} />

        <div className="grid gap-4 xl:grid-cols-4">
          {snapshot.metrics.map((metric: (typeof snapshot.metrics)[number]) => (
            <MetricCard key={metric.id} label={metric.label} value={metric.value} status={metric.status} progress={metric.progress} />
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.8fr_1fr]">
          <ConnectedDevices devices={snapshot.devices} />
          <div className="space-y-4">
            <QuickActions actions={snapshot.quickActions} />
            <ActivityFeed items={snapshot.activities} />
          </div>
        </div>
      </div>
    );
  }, [error, loading, snapshot]);

  return content;
};
