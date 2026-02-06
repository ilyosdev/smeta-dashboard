import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FileSpreadsheet,
  ArrowLeft,
  Download,
  Upload,
  Calendar,
  Loader2,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { smetasApi, Smeta } from "@/lib/api/smetas";
import { smetaItemsApi, SmetaItem, SmetaItemType } from "@/lib/api/smeta-items";
import { ErrorMessage } from "@/components/ui/error-message";
import { ProgressBar } from "@/components/dashboard/progress-bar";

function formatNumber(num: number): string {
  return num.toLocaleString("uz-UZ");
}

const ITEM_TYPE_LABELS: Record<SmetaItemType, string> = {
  WORK: "Ish",
  MACHINE: "Texnika",
  MATERIAL: "Material",
  OTHER: "Boshqa",
};

const ITEM_TYPE_COLORS: Record<SmetaItemType, string> = {
  WORK: "bg-blue-100 text-blue-700",
  MACHINE: "bg-purple-100 text-purple-700",
  MATERIAL: "bg-green-100 text-green-700",
  OTHER: "bg-gray-100 text-gray-700",
};

export default function SmetaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [smeta, setSmeta] = useState<Smeta | null>(null);
  const [items, setItems] = useState<SmetaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const [smetaData, itemsData] = await Promise.all([
          smetasApi.getById(id),
          smetaItemsApi.getAll({ smetaId: id, limit: 100 }),
        ]);
        setSmeta(smetaData);
        setItems(itemsData.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ma'lumotlarni yuklashda xatolik");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !smeta) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Button variant="ghost" asChild>
          <Link to="/projects" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Ortga
          </Link>
        </Button>
        <ErrorMessage error={error || "Smeta topilmadi"} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild>
          <Link to="/projects" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Ortga
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <FileSpreadsheet className="h-4 w-4" />
                Smeta
              </div>
              <h1 className="text-2xl font-bold tracking-tight">{smeta.name}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(smeta.createdAt).toLocaleDateString("uz-UZ")}
                </span>
                <span className="flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  {items.length} ta element
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Yuklab olish
              </Button>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Yangilash
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            Smeta elementlari
          </CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Bu smetada hali elementlar yo'q
            </p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-lg border bg-card space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{item.name}</h4>
                        <Badge className={ITEM_TYPE_COLORS[item.itemType]}>
                          {ITEM_TYPE_LABELS[item.itemType]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {item.code || item.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatNumber(item.totalAmount)} so'm
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatNumber(item.quantity)} {item.unit} x {formatNumber(item.unitPrice)}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ishlatilgan</span>
                      <span>{formatNumber(item.usedQuantity)} / {formatNumber(item.quantity)} {item.unit}</span>
                    </div>
                    <ProgressBar
                      value={item.usedQuantity}
                      max={item.quantity || 1}
                      size="sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
