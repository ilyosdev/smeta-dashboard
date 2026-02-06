import { CheckSquare, Clock, AlertTriangle, CheckCircle, XCircle, User } from "lucide-react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useApi, useMutation } from "@/hooks/use-api";
import { workersApi, WorkLog } from "@/lib/api/workers";
import { smetaItemsApi, SmetaItem } from "@/lib/api/smeta-items";
import { StatsSkeleton } from "@/components/ui/table-skeleton";
import { ErrorMessage } from "@/components/ui/error-message";

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  return num.toLocaleString("uz-UZ");
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("uz-UZ", {
    day: "numeric",
    month: "short",
  });
}

interface SmetaAlert {
  id: string;
  name: string;
  usedPercentage: number;
  usedQuantity: number;
  quantity: number;
  unit: string;
}

export default function ValidationPage() {
  // Fetch unvalidated (pending) work logs
  const {
    data: pendingWorkLogsResponse,
    loading: pendingLoading,
    error: pendingError,
    refetch: refetchPending,
  } = useApi(() => workersApi.getUnvalidatedWorkLogs({ limit: 50 }), []);

  // Fetch all work logs to filter validated ones from today
  const todayStr = new Date().toISOString().split("T")[0];
  const {
    data: allWorkLogsResponse,
    loading: allWorkLogsLoading,
  } = useApi(() => workersApi.getWorkLogs({ limit: 100 }), []);

  // Fetch smeta items to calculate alerts (items near budget threshold)
  const {
    data: smetaItemsResponse,
    loading: smetaItemsLoading,
    error: smetaItemsError,
    refetch: refetchSmetaItems,
  } = useApi(() => smetaItemsApi.getAll({ limit: 500 }), []);

  // Mutation for validating work logs
  const { mutate: validateWorkLog, loading: validatingId } = useMutation(
    ({ id, isValidated }: { id: string; isValidated: boolean }) =>
      workersApi.validateWorkLog(id, { isValidated })
  );

  const loading = pendingLoading || allWorkLogsLoading || smetaItemsLoading;
  const error = pendingError || smetaItemsError;

  const pendingWorkLogs = pendingWorkLogsResponse?.data || [];
  const allWorkLogs = allWorkLogsResponse?.data || [];

  // Filter work logs validated today
  const validatedToday = allWorkLogs.filter(
    (log) => log.isValidated && log.validatedAt && log.validatedAt.startsWith(todayStr)
  );

  // Count approved (validated) and rejected
  const approvedCount = validatedToday.length;
  // For now, we don't have a separate "rejected" status in the backend,
  // so we just show validated as approved
  const rejectedCount = 0;

  // Calculate smeta alerts - items where usedQuantity/quantity >= 80%
  const smetaItems = smetaItemsResponse?.data || [];
  const smetaAlerts: SmetaAlert[] = smetaItems
    .filter((item: SmetaItem) => {
      const usedPercentage = item.quantity > 0 ? (item.usedQuantity / item.quantity) * 100 : 0;
      return usedPercentage >= 80;
    })
    .map((item: SmetaItem) => ({
      id: item.id,
      name: item.name,
      usedPercentage: item.quantity > 0 ? Math.round((item.usedQuantity / item.quantity) * 100) : 0,
      usedQuantity: item.usedQuantity,
      quantity: item.quantity,
      unit: item.unit,
    }))
    .sort((a, b) => b.usedPercentage - a.usedPercentage);

  const handleValidate = async (workLog: WorkLog, approve: boolean) => {
    try {
      await validateWorkLog({ id: workLog.id, isValidated: approve });
      refetchPending();
    } catch (err) {
      console.error("Failed to validate work log:", err);
    }
  };

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Tekshirish</h1>
          <p className="text-muted-foreground">Ish hisobotlari va smeta nazorati</p>
        </div>
        <ErrorMessage
          error={error}
          onRetry={() => {
            refetchPending();
            refetchSmetaItems();
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Tekshirish</h1>
        <p className="text-muted-foreground">Ish hisobotlari va smeta nazorati</p>
      </div>

      {loading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Kutilmoqda"
            value={pendingWorkLogs.length}
            subtitle="ta hisobot"
            icon={Clock}
            variant="warning"
            className="animate-slide-up stagger-1"
          />
          <StatsCard
            title="Bugun tasdiqlandi"
            value={approvedCount}
            subtitle="ta hisobot"
            icon={CheckCircle}
            variant="success"
            className="animate-slide-up stagger-2"
          />
          <StatsCard
            title="Rad etildi"
            value={rejectedCount}
            subtitle="ta hisobot"
            icon={XCircle}
            variant="danger"
            className="animate-slide-up stagger-3"
          />
          <StatsCard
            title="Smeta ogohlantirishlari"
            value={smetaAlerts.length}
            subtitle="ta material"
            icon={AlertTriangle}
            variant="warning"
            className="animate-slide-up stagger-4"
          />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-warning" />
              Tekshirish kutayotgan ishlar
            </CardTitle>
            <CardDescription>Prorablar hisobotlari</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-muted/50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : pendingWorkLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Hozircha tekshirish kerak bo'lgan ishlar yo'q</p>
                <p className="text-sm mt-1">
                  Prorablar hisobot yuborganda bu yerda ko'rsatiladi
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingWorkLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 rounded-lg border bg-card space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{log.workType}</p>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>{log.worker?.name || log.loggedBy.name}</span>
                          {log.project && (
                            <>
                              <span className="text-muted-foreground/50">|</span>
                              <span>{log.project.name}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline" className="shrink-0">
                        {formatDate(log.date)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground">
                          {log.quantity} {log.unit}
                        </span>
                        {log.totalAmount !== null && log.totalAmount !== undefined && (
                          <span className="font-medium">
                            {formatNumber(log.totalAmount)} so'm
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleValidate(log, false)}
                          disabled={!!validatingId}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Rad etish
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleValidate(log, true)}
                          disabled={!!validatingId}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Tasdiqlash
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                Smeta ogohlantirishlari
              </CardTitle>
              <CardDescription>Chegaraga yaqin materiallar</CardDescription>
            </CardHeader>
            <CardContent>
              {smetaItemsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : smetaAlerts.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <AlertTriangle className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Hozircha ogohlantirish yo'q</p>
                  <p className="text-xs mt-1">
                    Materiallar chegaraga yaqinlashganda ko'rsatiladi
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {smetaAlerts.slice(0, 5).map((alert) => (
                    <div
                      key={alert.id}
                      className="p-3 rounded-lg border bg-card space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-sm truncate flex-1">
                          {alert.name}
                        </p>
                        <Badge
                          variant={alert.usedPercentage >= 100 ? "destructive" : "secondary"}
                          className={alert.usedPercentage >= 100 ? "" : "bg-warning/10 text-warning"}
                        >
                          {alert.usedPercentage}%
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {formatNumber(alert.usedQuantity)} / {formatNumber(alert.quantity)} {alert.unit}
                        </span>
                        {alert.usedPercentage >= 100 && (
                          <span className="text-destructive font-medium">
                            Chegara oshdi!
                          </span>
                        )}
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${
                            alert.usedPercentage >= 100
                              ? "bg-destructive"
                              : "bg-warning"
                          }`}
                          style={{ width: `${Math.min(alert.usedPercentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  {smetaAlerts.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center pt-2">
                      +{smetaAlerts.length - 5} ta boshqa ogohlantirish
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="animate-slide-up" style={{ animationDelay: "0.4s" }}>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-success" />
                Bugun tekshirilganlar
              </CardTitle>
            </CardHeader>
            <CardContent>
              {allWorkLogsLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : validatedToday.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <CheckCircle className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Bugun tekshirilgan ishlar yo'q</p>
                  <p className="text-xs mt-1">
                    Ishlar tasdiqlanishi yoki rad etilganda ko'rsatiladi
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {validatedToday.slice(0, 5).map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-lg border bg-card space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm truncate">
                          {log.workType}
                        </p>
                        <Badge variant="secondary" className="bg-success/10 text-success shrink-0">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Tasdiqlandi
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{log.worker?.name || log.loggedBy.name}</span>
                        <span>
                          {log.quantity} {log.unit}
                        </span>
                      </div>
                    </div>
                  ))}
                  {validatedToday.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center pt-2">
                      +{validatedToday.length - 5} ta boshqa
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
