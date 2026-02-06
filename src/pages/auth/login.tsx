import { Suspense, useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { HardHat, Eye, EyeOff, Loader2, Send } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4001';
const TELEGRAM_BOT_ID = import.meta.env.VITE_TELEGRAM_BOT_ID;

function LoginForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const errorParam = searchParams.get("error");
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(callbackUrl, { replace: true });
    }
  }, [authLoading, isAuthenticated, callbackUrl, navigate]);

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTelegramLoading, setIsTelegramLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(errorParam || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const fullPhone = "+998" + phone.replace(/\s/g, "");

    try {
      await login(fullPhone, password);
      navigate(callbackUrl, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kirish xatoligi");
      setIsLoading(false);
    }
  };

  const handleTelegramLogin = async () => {
    setIsTelegramLoading(true);
    setError("");

    if (!TELEGRAM_BOT_ID) {
      setError("Telegram bot sozlanmagan");
      setIsTelegramLoading(false);
      return;
    }

    const authUrl = `https://oauth.telegram.org/auth?bot_id=${TELEGRAM_BOT_ID}&origin=${encodeURIComponent(window.location.origin)}&request_access=write&return_to=${encodeURIComponent(window.location.href)}`;

    const width = 550;
    const height = 470;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;

    const popup = window.open(
      authUrl,
      "telegram_auth",
      `width=${width},height=${height},left=${left},top=${top}`
    );

    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== "https://oauth.telegram.org") return;

      const data = event.data;
      if (data?.event === "auth_result" && data?.result) {
        window.removeEventListener("message", handleMessage);
        popup?.close();

        try {
          const verifyResponse = await fetch(`${API_URL}/api/auth/telegram`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data.result),
          });

          if (!verifyResponse.ok) {
            const errorData = await verifyResponse.json();
            throw new Error(errorData.error || "Telegram tekshiruvda xatolik");
          }

          const response = await verifyResponse.json();

          if (response.accessToken && response.refreshToken) {
            await login(response.user.phone, '');
            navigate(callbackUrl, { replace: true });
          } else {
            setError("Telegram orqali kirish xatoligi");
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : "Xatolik yuz berdi");
        }
      }
      setIsTelegramLoading(false);
    };

    window.addEventListener("message", handleMessage);

    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed);
        window.removeEventListener("message", handleMessage);
        setIsTelegramLoading(false);
      }
    }, 500);
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 3) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
    if (digits.length <= 8) return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
    return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  return (
    <Card className="w-full shadow-2xl shadow-primary/10 border-0 bg-card/95 backdrop-blur-sm animate-fade-in">
      <CardHeader className="space-y-4 pb-6">
        <div className="flex justify-center">
          <div className="flex items-center gap-3 group">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-white shadow-lg shadow-primary/30 transition-transform group-hover:scale-105">
              <HardHat className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">SMETAKON</h1>
              <p className="text-xs text-muted-foreground">Qurilish byudjetini boshqarish</p>
            </div>
          </div>
        </div>
        <div className="text-center">
          <CardTitle className="text-xl">Tizimga kirish</CardTitle>
          <CardDescription className="mt-1">
            Hisobingizga kirish uchun ma'lumotlarni kiriting
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="phone">Telefon raqam</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                +998
              </span>
              <Input
                id="phone"
                type="tel"
                placeholder="__ ___ __ __"
                value={phone}
                onChange={handlePhoneChange}
                className="pl-14 h-11 bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Parol</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Parolingizni kiriting"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10 h-11 bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-11 w-11 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label
                htmlFor="remember"
                className="text-sm font-normal cursor-pointer"
              >
                Eslab qolish
              </Label>
            </div>
            <Link
              to="/forgot-password"
              className="text-sm text-primary hover:underline font-medium"
            >
              Parolni unutdingizmi?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg shadow-primary/25 transition-all duration-300"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Kirish...
              </>
            ) : (
              "Kirish"
            )}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-muted-foreground/20" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-3 text-muted-foreground font-medium">yoki</span>
          </div>
        </div>

        <Button
          type="button"
          onClick={handleTelegramLogin}
          disabled={isTelegramLoading}
          className="w-full h-11 bg-[#0088cc] hover:bg-[#0077b5] text-white shadow-lg shadow-[#0088cc]/25 transition-all duration-300"
        >
          {isTelegramLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Telegram...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Telegram orqali kirish
            </>
          )}
        </Button>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Hisobingiz yo'qmi?{" "}
            <Link to="/register" className="text-primary hover:underline font-medium">
              Ro'yxatdan o'ting
            </Link>
          </p>
        </div>

        <div className="mt-6 pt-6 border-t text-center">
          <p className="text-xs text-muted-foreground">
            Tizimga kirishda muammo bormi?{" "}
            <a
              href="https://t.me/smetakon_support"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Yordam
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <Card className="w-full shadow-2xl shadow-primary/10 border-0 bg-card/95 backdrop-blur-sm">
        <CardContent className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    }>
      <LoginForm />
    </Suspense>
  );
}
