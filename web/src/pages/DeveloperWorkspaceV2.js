import { useState, useEffect } from 'react';
import { useAuth } from '@/App';
import { Target, Zap, AlertCircle, Clock, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { runtime } from '@/runtime';
import { useLang } from '@/contexts/LanguageContext';
export default function DeveloperWorkspaceV2() {
  const { tByEn } = useLang();
  const { user } = useAuth();
  const [focusTask, setFocusTask] = useState(null);
  const [workload, setWorkload] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [activeTab, setActiveTab] = useState('focus');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkspaceData();
  }, []);

  const loadWorkspaceData = async () => {
    try {
      setLoading(true);
      const [focusRes, workloadRes, performanceRes] = await Promise.all([
        runtime.get(`/api/developer/focus`),
        runtime.get(`/api/developer/workload`),
        runtime.get(`/api/developer/performance`)
      ]);
      
      setFocusTask(focusRes.data);
      setWorkload(workloadRes.data);
      setPerformance(performanceRes.data);
    } catch (error) {
      console.error('Error loading workspace:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLoadBadge = (status) => {
    // Theme-aware status pill — matches the platform's design language
    // (used in Projects/Leaderboard cards: subtle tinted bg + accent dot + text).
    const badges = {
      available: {
        label: tByEn('Available'),
        dot:    'bg-emerald-500',
        wrap:   'bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-400 dark:border-emerald-500/20',
      },
      optimal: {
        label: tByEn('Optimal'),
        dot:    'bg-amber-500',
        wrap:   'bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-400 dark:border-amber-500/20',
      },
      overloaded: {
        label: tByEn('Overloaded'),
        dot:    'bg-rose-500',
        wrap:   'bg-rose-500/10 text-rose-700 border-rose-500/30 dark:text-rose-400 dark:border-rose-500/20',
      },
    };
    return badges[status] || badges.available;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">{tByEn('Loading workspace...')}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-3xl font-bold leading-tight">{tByEn('Developer Workspace')}</h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">{tByEn('Focus zone, active work, and performance')}</p>
        </div>
        {workload && (() => {
          const b = getLoadBadge(workload.load_status);
          return (
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold tracking-tight ${b.wrap}`}
              data-testid="dev-workload-status"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${b.dot}`} aria-hidden />
              {b.label}
            </span>
          );
        })()}
      </div>

      {/* Workload Overview — compact 2x2 grid on mobile */}
      <div
        className="grid md:grid-cols-4 gap-2 md:gap-4"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}
      >
        <Card className="p-0">
          <CardHeader className="flex flex-row items-center justify-between p-3 pb-1">
            <CardTitle className="text-[11px] md:text-sm font-semibold leading-tight">{tByEn('Utilization')}</CardTitle>
            <span className="inline-flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-lg bg-signal/10 ring-1 ring-signal/30 text-signal shrink-0">
              <TrendingUp className="h-3.5 w-3.5" />
            </span>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-xl md:text-2xl font-bold text-foreground leading-none">{workload?.utilization_percent || 0}%</div>
            <Progress value={workload?.utilization_percent || 0} className="mt-2 h-1.5" />
            <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
              {workload?.current_load_hours || 0}h / {workload?.capacity_hours_per_week || 0}h
            </p>
          </CardContent>
        </Card>

        <Card className="p-0">
          <CardHeader className="flex flex-row items-center justify-between p-3 pb-1">
            <CardTitle className="text-[11px] md:text-sm font-semibold leading-tight">{tByEn('Active Tasks')}</CardTitle>
            <span className="inline-flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-lg bg-signal/10 ring-1 ring-signal/30 text-signal shrink-0">
              <Zap className="h-3.5 w-3.5" />
            </span>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-xl md:text-2xl font-bold text-foreground leading-none">{workload?.active_tasks_count || 0}</div>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-1">{tByEn('In progress')}</p>
          </CardContent>
        </Card>

        <Card className="p-0">
          <CardHeader className="flex flex-row items-center justify-between p-3 pb-1">
            <CardTitle className="text-[11px] md:text-sm font-semibold leading-tight">{tByEn('Revisions')}</CardTitle>
            <span className="inline-flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-lg bg-orange-500/10 ring-1 ring-orange-500/30 text-orange-500 shrink-0">
              <AlertCircle className="h-3.5 w-3.5" />
            </span>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-xl md:text-2xl font-bold text-foreground leading-none">{workload?.revision_tasks_count || 0}</div>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-1">{tByEn('Need fixing')}</p>
          </CardContent>
        </Card>

        <Card className="p-0">
          <CardHeader className="flex flex-row items-center justify-between p-3 pb-1">
            <CardTitle className="text-[11px] md:text-sm font-semibold leading-tight">{tByEn('QA Pass Rate')}</CardTitle>
            <span className="inline-flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-lg bg-emerald-500/10 ring-1 ring-emerald-500/30 text-emerald-500 shrink-0">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </span>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-xl md:text-2xl font-bold text-foreground leading-none">{performance ? Math.round(performance.qa_pass_rate * 100) : 0}%</div>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
              {performance?.approved_submissions || 0} / {performance?.total_submissions || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList
          className="w-full md:grid md:grid-cols-5 flex overflow-x-auto no-scrollbar gap-1 p-1 h-auto"
          style={{ scrollbarWidth: 'none' }}
        >
          <TabsTrigger value="focus" className="shrink-0 text-xs md:text-sm whitespace-nowrap px-3 py-1.5">🎯 {tByEn('Focus')}</TabsTrigger>
          <TabsTrigger value="active" className="shrink-0 text-xs md:text-sm whitespace-nowrap px-3 py-1.5">⚡ {tByEn('Active')}</TabsTrigger>
          <TabsTrigger value="revisions" className="shrink-0 text-xs md:text-sm whitespace-nowrap px-3 py-1.5">🔧 {tByEn('Revisions')}</TabsTrigger>
          <TabsTrigger value="queue" className="shrink-0 text-xs md:text-sm whitespace-nowrap px-3 py-1.5">📋 {tByEn('Queue')}</TabsTrigger>
          <TabsTrigger value="performance" className="shrink-0 text-xs md:text-sm whitespace-nowrap px-3 py-1.5">📊 {tByEn('Performance')}</TabsTrigger>
        </TabsList>

        {/* Focus Zone */}
        <TabsContent value="focus" className="space-y-4">
          {focusTask ? (
            <Card className="border-2 border-primary">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <CardTitle>{tByEn('Main Focus Task')}</CardTitle>
                </div>
                <CardDescription>{tByEn('Your highest priority task right now')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-2xl font-bold mb-2">{focusTask.title}</div>
                  <div className="text-sm text-muted-foreground mb-4">
                    {focusTask.project_name} • {tByEn('Priority Score')}: {Math.round(focusTask.priority_score * 100)}%
                  </div>
                  <div className="prose prose-sm">
                    <p>{focusTask.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 bg-accent rounded-lg">
                  <div>
                    <div className="text-sm text-muted-foreground">{tByEn('Why Focus?')}</div>
                    <div className="font-medium">{focusTask.why_focus}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">{tByEn('What Next?')}</div>
                    <div className="font-medium">{focusTask.what_next}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">{tByEn('Estimated')}</div>
                    <div className="font-medium">{focusTask.estimated_hours}h</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">{tByEn('Status')}</div>
                    <Badge>{focusTask.status}</Badge>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1">
                    <Zap className="h-4 w-4 mr-2" />
                    {tByEn('Start Working')}
                  </Button>
                  <Button variant="outline" className="flex-1">
                    {tByEn('View Details')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium">{tByEn('No focus task assigned')}</p>
                <p className="text-sm text-muted-foreground">{tByEn('All tasks completed or no assignments yet')}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Active Work */}
        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{tByEn('Active Work')}</CardTitle>
              <CardDescription>{tByEn('Tasks currently in progress')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>{tByEn('Active tasks list (connect to /developer/work-units)')}</p>
                <p className="text-sm mt-2">{workload?.active_tasks_count || 0} {tByEn('tasks active')}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revisions */}
        <TabsContent value="revisions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{tByEn('Revisions Needed')}</CardTitle>
              <CardDescription>{tByEn('Tasks returned from QA')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-2 text-orange-500" />
                <p>{workload?.revision_tasks_count || 0} {tByEn('tasks need fixing')}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Queue */}
        <TabsContent value="queue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{tByEn('Task Queue')}</CardTitle>
              <CardDescription>{tByEn('Upcoming tasks to pick up')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>{tByEn('Queued tasks (assigned but not started)')}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>{tByEn('Quality Metrics')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">{tByEn('QA Pass Rate')}</span>
                    <span className="text-sm font-medium">{performance ? Math.round(performance.qa_pass_rate * 100) : 0}%</span>
                  </div>
                  <Progress value={performance ? performance.qa_pass_rate * 100 : 0} />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">{tByEn('Revision Rate')}</span>
                    <span className="text-sm font-medium">{performance ? Math.round(performance.revision_rate * 100) : 0}%</span>
                  </div>
                  <Progress value={performance ? performance.revision_rate * 100 : 0} className="bg-red-100" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{tByEn('Delivery Metrics')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">{tByEn('Tasks Completed')}</div>
                    <div className="text-2xl font-bold">{performance?.tasks_completed || 0}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">{tByEn('Avg Time')}</div>
                    <div className="text-2xl font-bold">{performance?.avg_completion_time || 0}h</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}