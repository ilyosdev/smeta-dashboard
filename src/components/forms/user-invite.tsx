
import { useState } from "react";
import { UserPlus, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  DialogFooter,
} from "@/components/ui/dialog";

interface UserInviteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const roles = [
  { value: "admin", label: "Admin", description: "Tizimni to'liq boshqarish huquqi" },
  { value: "direktor", label: "Direktor", description: "Loyihalarni kuzatish va tasdiqlash" },
  { value: "buxgalter", label: "Buxgalter", description: "Moliyaviy hisobotlar va tahlillar" },
  { value: "smetachi", label: "Smetachi", description: "Smeta yaratish va tahrirlash" },
  { value: "snabjenets", label: "Snabjenets", description: "Xarid so'rovlari yaratish" },
  { value: "ishchi", label: "Ishchi", description: "Faqat ko'rish va chek yuborish" },
];

export function UserInvite({ open, onOpenChange }: UserInviteProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("ishchi");
  const [sendTelegram, setSendTelegram] = useState(false);
  const [phone, setPhone] = useState("");

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
    if (digits.length <= 7) return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
    return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    onOpenChange(false);
    setPhone("");
    setSelectedRole("ishchi");
    setSendTelegram(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Xodim qo'shish
          </DialogTitle>
          <DialogDescription>Yangi xodimni tizimga taklif qiling</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Ism</Label>
            <Input id="name" placeholder="Familiya Ism" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefon raqam</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                +998
              </span>
              <Input
                id="phone"
                type="tel"
                className="pl-14"
                placeholder="__ ___ __ __"
                value={phone}
                onChange={handlePhoneChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Rol</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Card className="p-3 bg-muted/50">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">
                    {roles.find((r) => r.value === selectedRole)?.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {roles.find((r) => r.value === selectedRole)?.description}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="telegram"
              checked={sendTelegram}
              onCheckedChange={(checked) => setSendTelegram(checked as boolean)}
            />
            <Label htmlFor="telegram" className="text-sm font-normal cursor-pointer">
              Telegram orqali xabar yuborish
            </Label>
          </div>

          <DialogFooter className="gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Bekor qilish
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <UserPlus className="h-4 w-4 mr-2" />
              )}
              Qo'shish
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
