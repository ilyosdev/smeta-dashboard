import { useState, useMemo } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Package,
  DollarSign,
  Percent,
  Download,
  Building2,
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/stats-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { useApi } from "@/hooks/use-api";
import { projectsApi } from "@/lib/api/projects";
import { smetaItemsApi, SmetaItem } from "@/lib/api/smeta-items";
import { StatsSkeleton } from "@/components/ui/table-skeleton";
import { ErrorMessage } from "@/components/ui/error-message";

function formatNumber(num: number): string {
  return num.toLocaleString("uz-UZ");
}

function formatMoney(num: number): string {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(2) + " mlrd";
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + " mln";
  }
  return num.toLocaleString("uz-UZ") + " so'm";
}

interface ComparisonRow {
  id: string;
  name: string;
  unit: string;
  smetaQty: number;
  smetaPrice: number;
  smetaTotal: number;
  usedQty: number;
  actualSpent: number;
  percentUsed: number;
  status: "ok" | "warning" | "over";
  difference: number;
}

export default function SmetaComparisonPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  // Fetch projects
  const {
    data: projectsResponse,
    loading: projectsLoading,
    error: projectsError,
    refetch: refetchProjects,
  } = useApi(() => projectsApi.getAll({ limit: 100 }), []);

  // Fetch smeta items (optionally filtered by project's smeta)
  const {
    data: smetaItemsResponse,
    loading: smetaItemsLoading,
    error: smetaItemsError,
    refetch: refetchSmetaItems,
  } = useApi(
    () => smetaItemsApi.getAll({ limit: 500 }),
    [],
    { enabled: true }
  );

  const projects = projectsResponse?.data || [];
  const smetaItems = smetaItemsResponse?.data || [];

  // Calculate comparison data
  const comparisonData: ComparisonRow[] = useMemo(() => {
    return smetaItems.map((item: SmetaItem) => {
      const percentUsed = item.quantity > 0
        ? (item.usedQuantity / item.quantity) * 100
        : 0;

      let status: "ok" | "warning" | "over" = "ok";
      if (percentUsed >= 100) {
        status = "over";
      } else if (percentUsed >= 80) {
        status = "warning";
      }

      const difference = item.totalAmount - item.usedAmount;

      return {
        id: item.id,
        name: item.name,
        unit: item.unit,
        smetaQty: item.quantity,
        smetaPrice: item.unitPrice,
        smetaTotal: item.totalAmount,
        usedQty: item.usedQuantity,
        actualSpent: item.usedAmount,
        percentUsed: Math.round(percentUsed),
        status,
        difference,
      };
    });
  }, [smetaItems]);

  // Calculate summary
  const summary = useMemo(() => {
    const totalBudget = comparisonData.reduce((sum, row) => sum + row.smetaTotal, 0);
    const totalSpent = comparisonData.reduce((sum, row) => sum + row.actualSpent, 0);
    const savings = totalBudget - totalSpent;
    const completion = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    const warningCount = comparisonData.filter(row => row.status === "warning").length;
    const overCount = comparisonData.filter(row => row.status === "over").length;

    return {
      totalBudget,
      totalSpent,
      savings,
      completion: Math.round(completion),
      warningCount,
      overCount,
    };
  }, [comparisonData]);

  const loading = projectsLoading || smetaItemsLoading;
  const error = projectsError || smetaItemsError;

  const handleExport = () => {
    // Create CSV content
    const headers = ["Material", "Birlik", "Smeta miqdori", "Smeta narxi", "Smeta summasi", "Ishlatilgan", "Haqiqiy sarflangan", "Foiz", "Holat"];
    const rows = comparisonData.map(row => [
      row.name,
      row.unit,
      row.smetaQty,
      row.smetaPrice,
      row.smetaTotal,
      row.usedQty,
      row.actualSpent,
      row.percentUsed + "%",
      row.status === "ok" ? "OK" : row.status === "warning" ? "Ogohlantirish" : "Oshib ketgan",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `smeta-comparison-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Smeta taqqoslash</h1>
          <p className="text-muted-foreground">Byudjet va haqiqiy sarflar taqqoslash</p>
        </div>
        <ErrorMessage error={error} onRetry={() => { refetchProjects(); refetchSmetaItems(); }} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Smeta taqqoslash</h1>
          <p className="text-muted-foreground">Byudjet va haqiqiy sarflar taqqoslash</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Loyihani tanlang" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Barcha loyihalar</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {loading ? (
        <StatsSkeleton />
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Jami byudjet"
              value={formatMoney(summary.totalBudget)}
              icon={DollarSign}
              variant="primary"
              className="animate-slide-up stagger-1"
            />
            <StatsCard
              title="Haqiqiy sarflangan"
              value={formatMoney(summary.totalSpent)}
              icon={TrendingDown}
              variant={summary.totalSpent > summary.totalBudget ? "danger" : "default"}
              className="animate-slide-up stagger-2"
            />
            <StatsCard
              title={summary.savings >= 0 ? "Tejab qolindi" : "Oshib ketdi"}
              value={formatMoney(Math.abs(summary.savings))}
              icon={summary.savings >= 0 ? TrendingUp : AlertTriangle}
              variant={summary.savings >= 0 ? "success" : "danger"}
              className="animate-slide-up stagger-3"
            />
            <StatsCard
              title="Bajarildi"
              value={`${summary.completion}%`}
              icon={Percent}
              variant="default"
              className="animate-slide-up stagger-4"
            />
          </div>

          {/* Alerts */}
          {(summary.warningCount > 0 || summary.overCount > 0) && (
            <div className="grid gap-4 sm:grid-cols-2">
              {summary.warningCount > 0 && (
                <Card className="border-warning/50 bg-warning/5">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-8 w-8 text-warning" />
                      <div>
                        <p className="font-semibold">{summary.warningCount} ta ogohlantirish</p>
                        <p className="text-sm text-muted-foreground">
                          Materiallar 80% dan oshgan
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              {summary.overCount > 0 && (
                <Card className="border-destructive/50 bg-destructive/5">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-8 w-8 text-destructive" />
                      <div>
                        <p className="font-semibold">{summary.overCount} ta oshib ketgan</p>
                        <p className="text-sm text-muted-foreground">
                          Materiallar chegaradan oshgan
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Batafsil taqqoslash
              </CardTitle>
              <CardDescription>
                Smeta va haqiqiy sarflar bo'yicha materiallar ro'yxati
              </CardDescription>
            </CardHeader>
            <CardContent>
              {comparisonData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Smeta ma'lumotlari topilmadi</p>
                  <p className="text-sm mt-1">Avval loyihaga smeta yuklang</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[200px]">Material</TableHead>
                        <TableHead className="text-right">Smeta miqdori</TableHead>
                        <TableHead className="text-right">Smeta narxi</TableHead>
                        <TableHead className="text-right">Ishlatilgan</TableHead>
                        <TableHead className="text-right">Sarflangan</TableHead>
                        <TableHead className="w-[150px]">Foiz</TableHead>
                        <TableHead className="text-center">Holat</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {comparisonData.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="font-medium">{row.name}</TableCell>
                          <TableCell className="text-right">
                            {formatNumber(row.smetaQty)} {row.unit}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatMoney(row.smetaPrice)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatNumber(row.usedQty)} {row.unit}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatMoney(row.actualSpent)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress
                                value={Math.min(row.percentUsed, 100)}
                                className={`h-2 ${
                                  row.status === "over"
                                    ? "[&>div]:bg-destructive"
                                    : row.status === "warning"
                                    ? "[&>div]:bg-warning"
                                    : "[&>div]:bg-success"
                                }`}
                              />
                              <span className="text-xs text-muted-foreground w-10">
                                {row.percentUsed}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <StatusBadge status={row.status} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: "ok" | "warning" | "over" }) {
  switch (status) {
    case "ok":
      return (
        <Badge variant="secondary" className="bg-success/10 text-success">
          <CheckCircle className="h-3 w-3 mr-1" />
          OK
        </Badge>
      );
    case "warning":
      return (
        <Badge variant="secondary" className="bg-warning/10 text-warning">
          <AlertTriangle className="h-3 w-3 mr-1" />
          80%+
        </Badge>
      );
    case "over":
      return (
        <Badge variant="secondary" className="bg-destructive/10 text-destructive">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Oshdi
        </Badge>
      );
  }
}
