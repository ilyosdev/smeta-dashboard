
import { useState } from "react";
import { Building2, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SubProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  mode?: "create" | "edit";
  initialData?: {
    name: string;
    floors: string;
    description: string;
  };
}

export function SubProjectForm({
  open,
  onOpenChange,
  projectName,
  mode = "create",
  initialData,
}: SubProjectFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            {mode === "create" ? "Yangi sub-loyiha" : "Sub-loyihani tahrirlash"}
          </DialogTitle>
          <DialogDescription>
            {projectName} loyihasiga {mode === "create" ? "yangi sub-loyiha qo'shing" : "sub-loyihani yangilang"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Sub-loyiha nomi</Label>
            <Input
              id="name"
              placeholder="Masalan: A blok"
              defaultValue={initialData?.name}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="floors">Qavatlar soni</Label>
            <Input
              id="floors"
              type="number"
              placeholder="9"
              min="1"
              max="100"
              defaultValue={initialData?.floors}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Tavsif (ixtiyoriy)</Label>
            <Textarea
              id="description"
              placeholder="Sub-loyiha haqida qo'shimcha ma'lumot..."
              defaultValue={initialData?.description}
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Bekor qilish
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {mode === "create" ? "Qo'shish" : "Saqlash"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
