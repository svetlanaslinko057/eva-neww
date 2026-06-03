import { useState, useEffect } from 'react';
import { useLang } from '../contexts/LanguageContext';
import { useAuth } from '@/App';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
  BarChart3,
  Star,
  Zap
} from 'lucide-react';
import { runtime } from '@/runtime';

// WEB-P4 — Backend Authority Contract.
// All performance metrics (totals, success rate, avg hours) come from
// `/api/developer/performance/summary`. Page renders JSON; no `.reduce`,
// `.filter` or `useMemo` for business state.
const DeveloperPerformance = () => {
  const { tByEn } = useLang();
  const { user } = useAuth();
  const [totals, setTotals] = useState({
    total_hours: 0,
    total_completed: 0,
    total_revisions: 0,
    success_rate_pct: 100,
    avg_hours_per_completed: 0,
  });
  const [completedRecent, setCompletedRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await runtime.get('/api/developer/performance/summary');
        const data = res.data || {};
        setTotals(data.totals || totals);
        setCompletedRecent(Array.isArray(data.completed_recent) ? data.completed_recent : []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-border border-t-signal rounded-full animate-spin" />
      </div>
    );
  }

  // presentation-only: clamp progress bar visual width to [0..100] of next-level threshold.
  // Server holds authoritative totals; this is pure CSS-width math.
  // eslint-disable-next-line no-restricted-syntax
  // presentation-only: CSS progress-bar visual width clamp [0..100]
  const progressPct = Math.min(Number(totals.total_hours) || 0, 100);

  return (
    <div className="min-h-screen p-4 md:p-8" data-testid="developer-performance">
      {/* Header */}
      <div className="relative mb-4 md:mb-10">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{tByEn('Performance')}</h1>
        <p className="text-sm text-muted-foreground mt-1 md:mt-2">{tByEn('Your stats and achievements')}</p>
      </div>

      {/* Profile Card — compact */}
      <div className="rounded-2xl border border-border bg-card p-4 md:p-8 mb-4 md:mb-8">
        <div className="flex items-start gap-3 md:gap-6">
          <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl bg-signal/15 flex items-center justify-center shrink-0">
            <span className="text-xl md:text-3xl font-bold text-foreground">
              {user?.name?.[0]?.toUpperCase() || 'D'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg md:text-2xl font-semibold truncate">{user?.name || 'Developer'}</h2>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5 md:mt-1">{user?.level || 'Junior'} Developer</p>
            <div className="flex items-center gap-3 md:gap-6 mt-2 md:mt-4 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-500" />
                <span className="text-xs md:text-sm text-muted-foreground">{user?.rating || '5.0'} rating</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 md:w-4 md:h-4 text-signal" />
                <span className="text-xs md:text-sm text-muted-foreground">{totals.total_hours}h total</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid — compact */}
      <div
        className="grid lg:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-8"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}
      >
        <StatCard
          label={tByEn('Completed Tasks')}
          value={totals.total_completed}
          icon={<CheckCircle2 className="w-3.5 h-3.5" />}
          color="emerald"
        />
        <StatCard
          label={tByEn('Success Rate')}
          value={`${totals.success_rate_pct}%`}
          icon={<TrendingUp className="w-3.5 h-3.5" />}
          color="blue"
        />
        <StatCard
          label={tByEn('Revisions')}
          value={totals.total_revisions}
          icon={<AlertCircle className="w-3.5 h-3.5" />}
          color="red"
          highlight={totals.total_revisions > 0}
        />
        <StatCard
          label={tByEn('Avg Time')}
          value={`${totals.avg_hours_per_completed}h`}
          icon={<Clock className="w-3.5 h-3.5" />}
          color="amber"
        />
      </div>

      {/* Total Hours Block — compact */}
      <div className="rounded-2xl border border-border bg-card p-4 md:p-8 mb-4 md:mb-8">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 md:mb-2">{tByEn('Total Hours Logged')}</div>
            <div className="text-3xl md:text-5xl font-bold text-foreground leading-none">{totals.total_hours}<span className="text-base md:text-2xl text-muted-foreground ml-2">{tByEn('hours')}</span></div>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-signal/10 flex items-center justify-center">
            <BarChart3 className="w-8 h-8 text-signal" />
          </div>
        </div>

        {/* presentation-only: visual progress bar against next-tier hours */}
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">{tByEn('Progress to next level')}</span>
            <span className="text-signal">{progressPct}/100h</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-signal/15 rounded-full transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Recent Completed (server-ordered, top 10) */}
      <div className="rounded-2xl border border-border bg-[var(--t-surface-raised)] overflow-hidden">
        <div className="px-6 py-5 border-b border-border flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <h2 className="font-semibold">{tByEn('Recently Completed')}</h2>
        </div>

        <div className="p-4">
          {completedRecent.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted mx-auto mb-4 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">{tByEn('No completed tasks yet')}</p>
              <p className="text-muted-foreground text-sm mt-1">{tByEn('Complete tasks to see them here')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {completedRecent.map((unit) => (
                <div
                  key={unit.unit_id}
                  className="p-4 rounded-xl border border-border bg-white/[0.02] flex items-center justify-between hover:bg-white/[0.04] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <span className="font-medium">{unit.title}</span>
                      <span className="text-muted-foreground text-sm ml-2">{unit.project_name}</span>
                    </div>
                  </div>
                  <span className="text-muted-foreground text-sm font-mono">{unit.actual_hours || 0}h</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, color, highlight }) => {
  const colors = {
    blue: 'text-signal',
    emerald: 'text-emerald-500',
    amber: 'text-amber-500',
    red: 'text-red-500'
  };
  const bgRing = {
    blue: 'bg-signal/10 ring-1 ring-signal/30',
    emerald: 'bg-emerald-500/10 ring-1 ring-emerald-500/30',
    amber: 'bg-amber-500/10 ring-1 ring-amber-500/30',
    red: 'bg-red-500/10 ring-1 ring-red-500/30',
  };

  return (
    <div className={`p-3 md:p-5 rounded-xl md:rounded-2xl border bg-card transition-all ${
      highlight ? 'border-red-500/40 bg-red-500/5' : 'border-border'
    }`}>
      <div className="flex items-center justify-between mb-1.5 md:mb-3 gap-2">
        <span className="text-[10px] md:text-xs font-semibold text-muted-foreground uppercase tracking-wide leading-tight">{label}</span>
        <span className={`inline-flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-lg ${bgRing[color]} ${colors[color]} shrink-0`}>{icon}</span>
      </div>
      <div className="text-xl md:text-3xl font-bold text-foreground leading-none">{value}</div>
    </div>
  );
};

export default DeveloperPerformance;
