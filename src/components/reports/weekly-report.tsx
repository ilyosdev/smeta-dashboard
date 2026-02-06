
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/dashboard/progress-bar";

interface WeeklyReportProps {
  data: {
    day: string;
    requests: number;
    amount: number;
  }[];
  summary: {
    totalRequests: number;
    approved: number;
    rejected: number;
    totalAmount: number;
  };
}

const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  return `${(value / 1000).toFixed(0)}K`;
};

export function WeeklyReport({ data, summary }: WeeklyReportProps) {
  const maxRequests = Math.max(...data.map((d) => d.requests));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Jami so'rovlar</p>
            <p className="text-2xl font-bold">{summary.totalRequests}</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Tasdiqlangan</p>
            <p className="text-2xl font-bold text-success">{summary.approved}</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Rad etilgan</p>
            <p className="text-2xl font-bold text-destructive">{summary.rejected}</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Jami summa</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(summary.totalAmount)}</p>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Haftalik statistika</CardTitle>
          <CardDescription>Har kungi so'rovlar soni va summasi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.map((day) => (
              <div key={day.day} className="flex items-center gap-4">
                <span className="w-8 text-sm font-medium">{day.day}</span>
                <div className="flex-1">
                  <ProgressBar
                    value={day.requests}
                    max={maxRequests}
                    size="md"
                    showLabel={false}
                  />
                </div>
                <div className="w-24 text-right">
                  <p className="text-sm font-medium">{day.requests} ta</p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(day.amount)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Haftalik grafik</CardTitle>
          <CardDescription>So'rovlar sonining vizual ko'rinishi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-2 h-48 pt-4">
            {data.map((item) => (
              <div key={item.day} className="flex flex-col items-center gap-2 flex-1">
                <div className="w-full flex items-end justify-center h-36">
                  <div
                    className="w-full max-w-10 rounded-t-md bg-gradient-to-t from-primary to-primary/60 transition-all duration-500"
                    style={{
                      height: `${(item.requests / maxRequests) * 100}%`,
                    }}
                  />
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium">{item.day}</p>
                  <p className="text-[10px] text-muted-foreground">{item.requests}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
