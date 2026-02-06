
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/dashboard/progress-bar";

interface BudgetChartProps {
  data: {
    category: string;
    budget: number;
    spent: number;
  }[];
  title?: string;
  description?: string;
}

const formatCurrency = (value: number) => {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B`;
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  return `${(value / 1000).toFixed(0)}K`;
};

export function BudgetChart({ data, title = "Byudjet taqsimoti", description }: BudgetChartProps) {
  const totalBudget = data.reduce((acc, item) => acc + item.budget, 0);
  const totalSpent = data.reduce((acc, item) => acc + item.spent, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between pb-4 border-b">
          <div>
            <p className="text-sm text-muted-foreground">Jami byudjet</p>
            <p className="text-xl font-bold">{formatCurrency(totalBudget)} so'm</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Sarflangan</p>
            <p className="text-xl font-bold text-primary">{formatCurrency(totalSpent)} so'm</p>
          </div>
        </div>

        <div className="space-y-4">
          {data.map((item) => {
            const percentage = Math.round((item.spent / item.budget) * 100);
            return (
              <div key={item.category} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.category}</span>
                  <span className="text-muted-foreground">
                    {formatCurrency(item.spent)} / {formatCurrency(item.budget)}
                  </span>
                </div>
                <ProgressBar value={item.spent} max={item.budget} size="sm" showLabel={false} />
                <div className="flex justify-end">
                  <span
                    className={`text-xs font-medium ${
                      percentage >= 90
                        ? "text-destructive"
                        : percentage >= 70
                        ? "text-warning"
                        : "text-muted-foreground"
                    }`}
                  >
                    {percentage}% ishlatilgan
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
