import { Package, ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, AlertTriangle } from "lucide-react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useApi } from "@/hooks/use-api";
import { warehousesApi } from "@/lib/api/warehouses";
import { StatsSkeleton } from "@/components/ui/table-skeleton";
import { ErrorMessage } from "@/components/ui/error-message";

function formatNumber(num: number): string {
  return num.toLocaleString("uz-UZ");
}

export default function WarehousePage() {
  const {
    data: warehousesResponse,
    loading: warehousesLoading,
    error: warehousesError,
    refetch: refetchWarehouses,
  } = useApi(() => warehousesApi.getAll({ limit: 100 }), []);

  const {
    data: transfersResponse,
    loading: transfersLoading,
  } = useApi(() => warehousesApi.getTransfers({ status: "PENDING", limit: 10 }), []);

  const loading = warehousesLoading || transfersLoading;
  const error = warehousesError;

  const warehouses = warehousesResponse?.data || [];
  const pendingTransfers = transfersResponse?.data || [];

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Ombor</h1>
          <p className="text-muted-foreground">Materiallar va inventar holati</p>
        </div>
        <ErrorMessage error={error} onRetry={refetchWarehouses} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Ombor</h1>
        <p className="text-muted-foreground">Materiallar va inventar holati</p>
      </div>

      {loading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Jami omborlar"
            value={warehouses.length}
            subtitle="ta"
            icon={Package}
            variant="primary"
            className="animate-slide-up stagger-1"
          />
          <StatsCard
            title="Bugun kirim"
            value={0}
            subtitle="ta yetkazma"
            icon={ArrowDownToLine}
            variant="success"
            className="animate-slide-up stagger-2"
          />
          <StatsCard
            title="Bugun chiqim"
            value={0}
            subtitle="ta berish"
            icon={ArrowUpFromLine}
            variant="warning"
            className="animate-slide-up stagger-3"
          />
          <StatsCard
            title="Kutilmoqda"
            value={pendingTransfers.length}
            subtitle="ta o'tkazma"
            icon={ArrowLeftRight}
            variant="default"
            className="animate-slide-up stagger-4"
          />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              Omborlar
            </CardTitle>
            <CardDescription>Mavjud omborlar ro'yxati</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {warehousesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : warehouses.length > 0 ? (
              warehouses.map((warehouse) => (
                <div key={warehouse.id} className="p-4 rounded-lg border bg-card space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{warehouse.name}</p>
                    {warehouse.location && (
                      <Badge variant="secondary">{warehouse.location}</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Yaratilgan: {new Date(warehouse.createdAt).toLocaleDateString("uz-UZ")}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Hozircha omborlar yo'q
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ArrowLeftRight className="h-4 w-4 text-warning" />
              Kutilayotgan o'tkazmalar
            </CardTitle>
            <CardDescription>Tasdiqlash kerak</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {transfersLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-20 bg-muted/50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : pendingTransfers.length > 0 ? (
              pendingTransfers.map((transfer) => (
                <div key={transfer.id} className="p-3 rounded-lg border bg-warning/5 border-warning/20">
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <Badge variant="outline">#{transfer.fromWarehouseId.slice(0, 6)}</Badge>
                    <ArrowLeftRight className="h-3 w-3 text-muted-foreground" />
                    <Badge variant="outline">#{transfer.toWarehouseId.slice(0, 6)}</Badge>
                  </div>
                  <p className="font-medium text-sm">Item: {transfer.smetaItemId.slice(0, 8)}...</p>
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(transfer.quantity)} ta
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Kutilayotgan o'tkazma yo'q
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
