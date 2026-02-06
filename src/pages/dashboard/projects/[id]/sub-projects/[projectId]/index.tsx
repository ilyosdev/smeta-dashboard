import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Building2,
  ArrowLeft,
  FileSpreadsheet,
  Plus,
  Calendar,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { projectsApi, Project } from "@/lib/api/projects";
import { smetasApi, Smeta } from "@/lib/api/smetas";
import { ErrorMessage } from "@/components/ui/error-message";

export default function SubProjectDetailPage() {
  const { id: parentProjectId, projectId } = useParams<{ id: string; projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [smetas, setSmetas] = useState<Smeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) return;
      setIsLoading(true);
      setError(null);
      try {
        const [projectData, smetasData] = await Promise.all([
          projectsApi.getById(projectId),
          smetasApi.getAll({ projectId, limit: 100 }),
        ]);
        setProject(projectData);
        setSmetas(smetasData.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ma'lumotlarni yuklashda xatolik");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Button variant="ghost" asChild>
          <Link to={`/projects/${parentProjectId}`} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Ortga
          </Link>
        </Button>
        <ErrorMessage error={error || "Loyiha topilmadi"} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild>
          <Link to={`/projects/${parentProjectId}`} className="flex items-center gap-2">
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
                <Building2 className="h-4 w-4" />
                Sub-loyiha
              </div>
              <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(project.createdAt).toLocaleDateString("uz-UZ")}
                </span>
              </div>
            </div>
            <Badge className="bg-success/10 text-success self-start">Faol</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Smetalar
          </h2>
          <p className="text-sm text-muted-foreground">{smetas.length} ta smeta</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Yangi smeta
        </Button>
      </div>

      {smetas.length === 0 ? (
        <Card className="p-8 text-center">
          <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Smetalar yo'q</h3>
          <p className="text-muted-foreground mb-4">
            Bu loyihada hali smetalar qo'shilmagan
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Birinchi smetani qo'shing
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {smetas.map((smeta, index) => (
            <Card
              key={smeta.id}
              className="overflow-hidden transition-all duration-200 hover:shadow-md animate-slide-up group"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CardContent className="p-5">
                <Link to={`/smetas/${smeta.id}`}>
                  <h3 className="font-semibold group-hover:text-primary transition-colors mb-2">
                    {smeta.name}
                  </h3>
                </Link>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(smeta.createdAt).toLocaleDateString("uz-UZ")}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <Badge className="bg-success/10 text-success">Faol</Badge>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/smetas/${smeta.id}`}>
                      Ko'rish
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
