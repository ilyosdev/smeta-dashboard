import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FolderKanban,
  ClipboardList,
  Users,
  Package,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Clock,
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import { useAuth, RoleGuard } from "@/lib/auth";
import { useApi } from "@/hooks/use-api";
import { smetasApi, projectsApi, requestsApi, usersApi } from "@/lib/api";
import { StatsSkeleton, CardSkeleton } from "@/components/ui/table-skeleton";
import { ErrorMessage } from "@/components/ui/error-message";

function formatNumber(num: number): string {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + "B";
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  return num.toLocaleString("uz-UZ");
}

export default function HomePage() {
  const { user } = useAuth();

  const {
    data: projectsResponse,
    loading: projectsLoading,
    error: projectsError,
    refetch: refetchProjects,
  } = useApi(() => projectsApi.getAll({ limit: 5 }), []);

  const {
    data: requestsResponse,
    loading: requestsLoading,
    error: requestsError,
    refetch: refetchRequests,
  } = useApi(() => requestsApi.getAll({ limit: 5, status: "PENDING" }), []);

  const {
    data: usersResponse,
    loading: usersLoading,
  } = useApi(() => usersApi.getAll({ limit: 100 }), []);

  const loading = projectsLoading || requestsLoading || usersLoading;
  const error = projectsError || requestsError;

  const projects = projectsResponse?.data || [];
  const pendingRequests = requestsResponse?.data || [];
  const users = usersResponse?.data || [];

  const totalProjects = projectsResponse?.total || 0;
  const totalPendingRequests = requestsResponse?.total || 0;
  const totalUsers = users.length;

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Bosh sahifa</h1>
          <p className="text-muted-foreground">Tizimga xush kelibsiz, {user?.name || "Foydalanuvchi"}</p>
        </div>
        <ErrorMessage error={error} onRetry={() => { refetchProjects(); refetchRequests(); }} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Bosh sahifa</h1>
        <p className="text-muted-foreground">Tizimga xush kelibsiz, {user?.name || "Foydalanuvchi"}</p>
      </div>

      {loading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Loyihalar"
            value={totalProjects}
            subtitle="ta faol"
            icon={FolderKanban}
            variant="primary"
            className="animate-slide-up stagger-1"
          />
          <StatsCard
            title="Kutayotgan so'rovlar"
            value={totalPendingRequests}
            subtitle="ta tasdiqlash kerak"
            icon={ClipboardList}
            variant="warning"
            className="animate-slide-up stagger-2"
          />
          <StatsCard
            title="Xodimlar"
            value={totalUsers}
            subtitle="ta faol"
            icon={Users}
            variant="success"
            className="animate-slide-up stagger-3"
          />
          <StatsCard
            title="Jami byudjet"
            value="0"
            subtitle="so'm"
            icon={TrendingUp}
            variant="default"
            className="animate-slide-up stagger-4"
          />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-primary" />
                Loyihalar
              </CardTitle>
              <CardDescription>Faol loyihalar ro'yxati</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/projects" className="flex items-center gap-1">
                Hammasi <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {projectsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : projects.length > 0 ? (
              projects.slice(0, 5).map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm">{project.name}</p>
                    <p className="text-xs text-muted-foreground">{project.address || "Joylashuv ko'rsatilmagan"}</p>
                  </div>
                  <Badge variant="secondary" className="bg-success/10 text-success">
                    Faol
                  </Badge>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Hozircha loyihalar yo'q
              </p>
            )}
          </CardContent>
        </Card>

        <RoleGuard allowedRoles={["DIREKTOR", "SNABJENIYA", "PTO"]}>
          <Card className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-warning" />
                  Kutayotgan so'rovlar
                </CardTitle>
                <CardDescription>Tasdiqlash kerak bo'lgan so'rovlar</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/requests/pending" className="flex items-center gap-1">
                  Hammasi <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {requestsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-muted/50 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : pendingRequests.length > 0 ? (
                pendingRequests.slice(0, 5).map((request) => (
                  <div
                    key={request.id}
                    className="p-3 rounded-lg border bg-warning/5 border-warning/20"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">
                          #{request.id.slice(0, 6)} - {request.smetaItem?.name || "Noma'lum"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatNumber(request.requestedQty)} {request.smetaItem?.unit || ""}
                        </p>
                      </div>
                      <Badge className="bg-warning/10 text-warning">Kutmoqda</Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Kutayotgan so'rov yo'q
                </p>
              )}
            </CardContent>
          </Card>
        </RoleGuard>
      </div>
    </div>
  );
}
