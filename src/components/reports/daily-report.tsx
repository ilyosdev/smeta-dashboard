
import { Clock, CheckCircle, XCircle, Package } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/dashboard/stats-card";
import { ProgressBar } from "@/components/dashboard/progress-bar";

interface DailyReportProps {
  date: string;
  stats: {
    totalRequests: number;
    approved: number;
    rejected: number;
    pending: number;
    totalAmount: number;
  };
  requests: {
    time: string;
    product: string;
    quantity: string;
    user: string;
    status: "approved" | "rejected" | "pending";
  }[];
  productStats: {
    name: string;
    quantity: string;
    amount: number;
    percent: number;
  }[];
}

const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  return `${(value / 1000).toFixed(0)}K`;
};

export function DailyReport({ date, stats, requests, productStats }: DailyReportProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Jami so'rovlar"
          value={stats.totalRequests}
          subtitle={date}
          icon={Package}
          variant="primary"
        />
        <StatsCard
          title="Tasdiqlangan"
          value={stats.approved}
          icon={CheckCircle}
          variant="success"
        />
        <StatsCard
          title="Rad etilgan"
          value={stats.rejected}
          icon={XCircle}
          variant="danger"
        />
        <StatsCard
          title="Kutilmoqda"
          value={stats.pending}
          icon={Clock}
          variant="warning"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Mahsulotlar bo'yicha</CardTitle>
            <CardDescription>Eng ko'p so'ralgan mahsulotlar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {productStats.map((product) => (
              <div key={product.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium">{product.name}</span>
                    <span className="text-muted-foreground ml-2">{product.quantity}</span>
                  </div>
                  <span className="font-semibold">{formatCurrency(product.amount)}</span>
                </div>
                <ProgressBar value={product.percent} size="sm" showLabel={false} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Kunlik umumiy</CardTitle>
            <CardDescription>Jami xarajatlar va statistika</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <span className="text-muted-foreground">Jami summa</span>
              <span className="text-xl font-bold text-primary">
                {formatCurrency(stats.totalAmount)} so'm
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 rounded-lg bg-success/10">
                <p className="text-2xl font-bold text-success">{stats.approved}</p>
                <p className="text-xs text-muted-foreground">Tasdiqlangan</p>
              </div>
              <div className="p-3 rounded-lg bg-destructive/10">
                <p className="text-2xl font-bold text-destructive">{stats.rejected}</p>
                <p className="text-xs text-muted-foreground">Rad etilgan</p>
              </div>
              <div className="p-3 rounded-lg bg-warning/10">
                <p className="text-2xl font-bold text-warning">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Kutilmoqda</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Barcha so'rovlar</CardTitle>
          <CardDescription>Kunlik barcha so'rovlar ro'yxati</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {requests.map((request, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-sm font-mono text-muted-foreground w-12">
                    {request.time}
                  </span>
                  <div>
                    <p className="font-medium text-sm">{request.product}</p>
                    <p className="text-xs text-muted-foreground">{request.quantity}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">{request.user}</span>
                  <Badge
                    className={
                      request.status === "approved"
                        ? "bg-success/10 text-success"
                        : request.status === "rejected"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-warning/10 text-warning"
                    }
                  >
                    {request.status === "approved"
                      ? "Tasdiqlandi"
                      : request.status === "rejected"
                      ? "Rad etildi"
                      : "Kutmoqda"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
