
import { useState, useCallback } from "react";
import { Upload, FileSpreadsheet, X, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";

interface SmetaUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
}

const smetaTypes = [
  { value: "construction", label: "Qurilish" },
  { value: "electrical", label: "Elektr montaj" },
  { value: "plumbing", label: "Santexnika" },
  { value: "finishing", label: "Pardozlash" },
  { value: "other", label: "Boshqa" },
];

export function SmetaUpload({ open, onOpenChange, projectName }: SmetaUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith(".xlsx") || droppedFile.name.endsWith(".xls"))) {
      setFile(droppedFile);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsUploading(false);
    setUploadComplete(true);

    setTimeout(() => {
      onOpenChange(false);
      setFile(null);
      setUploadComplete(false);
    }, 1500);
  };

  const removeFile = () => {
    setFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Smeta yuklash
          </DialogTitle>
          <DialogDescription>{projectName} uchun smeta yuklang</DialogDescription>
        </DialogHeader>

        {uploadComplete ? (
          <div className="py-8 text-center space-y-3">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center animate-fade-in">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
            </div>
            <h3 className="text-lg font-semibold">Smeta muvaffaqiyatli yuklandi!</h3>
            <p className="text-sm text-muted-foreground">Sahifa yangilanmoqda...</p>
          </div>
        ) : (
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="space-y-2">
              <Label>Smeta turi</Label>
              <Select defaultValue="construction">
                <SelectTrigger>
                  <SelectValue placeholder="Turni tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {smetaTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fayl</Label>
              {file ? (
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-primary/20">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileSpreadsheet className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={removeFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                    isDragging
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25 hover:border-primary/50"
                  )}
                >
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <FileSpreadsheet className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          Faylni bu yerga tashlang yoki{" "}
                          <span className="text-primary">tanlang</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          .xlsx, .xls formatlar qo'llab-quvvatlanadi
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Izoh (ixtiyoriy)</Label>
              <Textarea
                id="note"
                placeholder="Yangilangan narxlar bilan..."
                rows={2}
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
                disabled={!file || isUploading}
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Yuklash
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
