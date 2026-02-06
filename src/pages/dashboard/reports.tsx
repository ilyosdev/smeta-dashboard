import { useState, useEffect, useCallback } from "react";
import {
  ChartBar,
  Calendar,
  Download,
  FileText,
  CheckCircle,
  XCircle,
  TrendingUp,
  Package,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { StatsCard } from "@/components/dashboard/stats-card";
import { projectsApi } from "@/lib/api";

const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return value.toString();
};

interface Project {
  id: string;
  name: string;
}

export default function ReportsPage() {
  const [selectedProject, setSelectedProject] = useState("all");
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Stats that would come from API
  const [stats, setStats] = useState({
    totalRequests: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
    totalAmount: 0,
  });

  const fetchProjects = useCallback(async () => {
    try {
      const response = await projectsApi.getAll({ limit: 100 });
      setProjects(response.data);
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  }, []);

  const fetchReportData = useCallback(async () => {
    setIsLoading(true);
    try {
      // TODO: Fetch actual report data from API
      // const reportData = await reportsApi.getDaily({ projectId: selectedProject, date: selectedDate });
      // setStats(reportData);

      // For now, show zeros
      setStats({
        totalRequests: 0,
        approved: 0,
        rejected: 0,
        pending: 0,
        totalAmount: 0,
      });
    } catch (err) {
      console.error("Error fetching report data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedProject, selectedDate]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ChartBar className="h-6 w-6 text-primary" />
            Hisobotlar
          </h1>
          <p className="text-muted-foreground">Batafsil statistika va tahlillar</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" disabled>
            <FileText className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button variant="outline" disabled>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      <Tabs defaultValue="daily" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="daily" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Calendar className="h-4 w-4 mr-2" />
            Kunlik
          </TabsTrigger>
          <TabsTrigger value="weekly" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Calendar className="h-4 w-4 mr-2" />
            Haftalik
          </TabsTrigger>
          <TabsTrigger value="monthly" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Calendar className="h-4 w-4 mr-2" />
            Oylik
          </TabsTrigger>
        </TabsList>

        <Card className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-full sm:w-[200px] bg-muted/50 border-0">
                <SelectValue placeholder="Loyiha" />
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
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full sm:w-[180px] bg-muted/50 border-0"
            />
          </div>
        </Card>

        <TabsContent value="daily" className="space-y-6 mt-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                  title="Jami so'rovlar"
                  value={stats.totalRequests}
                  subtitle="bugun"
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
                  title="Jami summa"
                  value={formatCurrency(stats.totalAmount)}
                  subtitle="so'm"
                  icon={TrendingUp}
                  variant="default"
                />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Kunlik hisobot</CardTitle>
                  <CardDescription>Tanlangan kun uchun so'rovlar statistikasi</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.totalRequests === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <ChartBar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Bu kun uchun ma'lumotlar yo'q</p>
                      <p className="text-sm mt-1">So'rovlar kiritilganda statistika ko'rsatiladi</p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Hisobot ma'lumotlari</p>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="weekly" className="space-y-6 mt-0">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Jami so'rovlar"
              value={0}
              subtitle="bu hafta"
              icon={Package}
              variant="primary"
            />
            <StatsCard
              title="Tasdiqlangan"
              value={0}
              icon={CheckCircle}
              variant="success"
            />
            <StatsCard
              title="Rad etilgan"
              value={0}
              icon={XCircle}
              variant="danger"
            />
            <StatsCard
              title="Jami summa"
              value="0"
              subtitle="so'm"
              icon={TrendingUp}
              variant="default"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Haftalik statistika</CardTitle>
              <CardDescription>Har kungi so'rovlar soni va summasi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <ChartBar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Bu hafta uchun ma'lumotlar yo'q</p>
                <p className="text-sm mt-1">So'rovlar kiritilganda statistika ko'rsatiladi</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-6 mt-0">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Jami so'rovlar"
              value={0}
              subtitle="bu oy"
              icon={Package}
              variant="primary"
            />
            <StatsCard
              title="Tasdiqlangan"
              value={0}
              icon={CheckCircle}
              variant="success"
            />
            <StatsCard
              title="Rad etilgan"
              value={0}
              icon={XCircle}
              variant="danger"
            />
            <StatsCard
              title="Jami summa"
              value="0"
              subtitle="so'm"
              icon={TrendingUp}
              variant="default"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Oylik statistika</CardTitle>
              <CardDescription>Har haftalik so'rovlar soni va summasi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <ChartBar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Bu oy uchun ma'lumotlar yo'q</p>
                <p className="text-sm mt-1">So'rovlar kiritilganda statistika ko'rsatiladi</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
