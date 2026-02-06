
import { useState } from "react";
import { Building2, MapPin, Calendar, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit";
  initialData?: {
    name: string;
    location: string;
    budget: string;
    startDate: string;
    status: string;
    description: string;
  };
}

export function ProjectForm({
  open,
  onOpenChange,
  mode = "create",
  initialData,
}: ProjectFormProps) {
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            {mode === "create" ? "Yangi loyiha" : "Loyihani tahrirlash"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Yangi qurilish loyihasini yarating"
              : "Loyiha ma'lumotlarini yangilang"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Loyiha nomi</Label>
            <Input
              id="name"
              placeholder="Masalan: Navoiy 108-uy"
              defaultValue={initialData?.name}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Manzil</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="location"
                className="pl-9"
                placeholder="Tuman, shahar"
                defaultValue={initialData?.location}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="budget">Byudjet (so'm)</Label>
              <Input
                id="budget"
                type="number"
                placeholder="500,000,000"
                defaultValue={initialData?.budget}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Boshlanish sanasi</Label>
              <Input
                id="startDate"
                type="date"
                defaultValue={initialData?.startDate}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Holat</Label>
            <Select defaultValue={initialData?.status || "planned"}>
              <SelectTrigger>
                <SelectValue placeholder="Holatni tanlang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planned">Rejada</SelectItem>
                <SelectItem value="active">Faol</SelectItem>
                <SelectItem value="paused">To'xtatilgan</SelectItem>
                <SelectItem value="completed">Yakunlangan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Tavsif (ixtiyoriy)</Label>
            <Textarea
              id="description"
              placeholder="Loyiha haqida qo'shimcha ma'lumot..."
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
              {mode === "create" ? "Yaratish" : "Saqlash"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
