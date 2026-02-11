import { useState, useCallback } from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  History,
  HandCoins,
  PlusCircle,
  Eye,
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/stats-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useApi, useMutation } from "@/hooks/use-api";
import { useAuth } from "@/lib/auth";
import {
  cashRegistersApi,
  cashRequestsApi,
  CashTransaction,
  CashRegisterDetailed,
} from "@/lib/api/finance";
import { projectsApi } from "@/lib/api/projects";
import { PaginatedResponse } from "@/lib/api/client";
import { StatsSkeleton } from "@/components/ui/table-skeleton";
import { ErrorMessage } from "@/components/ui/error-message";

function formatMoney(num: number): string {
  return num.toLocaleString("uz-UZ");
}

type ActiveView = "balance" | "history" | "expenses";

export default function KassaPage() {
  const { user } = useAuth();
  const role = user?.role;
  const canRequestMoney = role !== "BUGALTERIYA";

  const [activeView, setActiveView] = useState<ActiveView>("balance");
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);

  // Date filter state
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Koshelok data
  const {
    data: koshelok,
    loading: koshelokLoading,
    error: koshelokError,
    refetch: refetchKoshelok,
  } = useApi(() => cashRegistersApi.getMyKoshelok(), []);

  // Transaction history (IN type)
  const {
    data: historyData,
    loading: historyLoading,
    refetch: refetchHistory,
  } = useApi(
    () =>
      koshelok
        ? cashRegistersApi.getTransactions(koshelok.id, {
            type: "IN",
            limit: 50,
            ...(dateFrom && { dateFrom }),
            ...(dateTo && { dateTo }),
          })
        : Promise.resolve({ data: [], total: 0, page: 1, limit: 50, totalPages: 0 } as PaginatedResponse<CashTransaction>),
    [koshelok?.id, dateFrom, dateTo],
    { enabled: activeView === "history" && !!koshelok }
  );

  // Expenses (OUT type)
  const {
    data: expensesData,
    loading: expensesLoading,
    refetch: refetchExpenses,
  } = useApi(
    () =>
      koshelok
        ? cashRegistersApi.getTransactions(koshelok.id, {
            type: "OUT",
            limit: 50,
            ...(dateFrom && { dateFrom }),
            ...(dateTo && { dateTo }),
          })
        : Promise.resolve({ data: [], total: 0, page: 1, limit: 50, totalPages: 0 } as PaginatedResponse<CashTransaction>),
    [koshelok?.id, dateFrom, dateTo],
    { enabled: activeView === "expenses" && !!koshelok }
  );

  if (koshelokError) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Kassa</h1>
          <p className="text-muted-foreground">Shaxsiy koshelok boshqaruvi</p>
        </div>
        <ErrorMessage error={koshelokError} onRetry={refetchKoshelok} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Kassa</h1>
        <p className="text-muted-foreground">Shaxsiy koshelok boshqaruvi</p>
      </div>

      {/* Balance cards */}
      {koshelokLoading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatsCard
            title="Balans"
            value={`${formatMoney(koshelok?.balance ?? 0)} so'm`}
            icon={Wallet}
            variant="primary"
            className="animate-slide-up stagger-1"
          />
          <StatsCard
            title="Jami kirim"
            value={`${formatMoney(koshelok?.totalIn ?? 0)} so'm`}
            icon={TrendingUp}
            variant="success"
            className="animate-slide-up stagger-2"
          />
          <StatsCard
            title="Jami chiqim"
            value={`${formatMoney(koshelok?.totalOut ?? 0)} so'm`}
            icon={TrendingDown}
            variant="danger"
            className="animate-slide-up stagger-3"
          />
        </div>
      )}

      {/* Action buttons */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        <ActionButton
          icon={Wallet}
          label="Balans"
          active={activeView === "balance"}
          onClick={() => setActiveView("balance")}
        />
        <ActionButton
          icon={History}
          label="Koshelok tarixi"
          active={activeView === "history"}
          onClick={() => setActiveView("history")}
        />
        {canRequestMoney && (
          <ActionButton
            icon={HandCoins}
            label="Pul so'rash"
            onClick={() => setRequestDialogOpen(true)}
          />
        )}
        <ActionButton
          icon={Eye}
          label="Rasxod ko'rish"
          active={activeView === "expenses"}
          onClick={() => setActiveView("expenses")}
        />
        <ActionButton
          icon={PlusCircle}
          label="Rasxod qo'shish"
          onClick={() => setExpenseDialogOpen(true)}
        />
      </div>

      {/* Date filters for history/expenses */}
      {(activeView === "history" || activeView === "expenses") && (
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Boshlanish</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-40"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Tugash</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-40"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDateFrom("");
                  setDateTo("");
                }}
              >
                Tozalash
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content area */}
      {activeView === "balance" && koshelok && (
        <BalanceView koshelok={koshelok} />
      )}
      {activeView === "history" && (
        <TransactionList
          title="Koshelok tarixi"
          subtitle="Kirim operatsiyalari"
          transactions={historyData?.data ?? []}
          loading={historyLoading}
          type="IN"
        />
      )}
      {activeView === "expenses" && (
        <TransactionList
          title="Rasxodlar"
          subtitle="Chiqim operatsiyalari"
          transactions={expensesData?.data ?? []}
          loading={expensesLoading}
          type="OUT"
        />
      )}

      {/* Request money dialog */}
      {canRequestMoney && (
        <RequestMoneyDialog
          open={requestDialogOpen}
          onOpenChange={setRequestDialogOpen}
          onSuccess={() => {
            setRequestDialogOpen(false);
          }}
        />
      )}

      {/* Add expense dialog */}
      <AddExpenseDialog
        open={expenseDialogOpen}
        onOpenChange={setExpenseDialogOpen}
        koshelokId={koshelok?.id}
        onSuccess={() => {
          setExpenseDialogOpen(false);
          refetchKoshelok();
          if (activeView === "expenses") refetchExpenses();
        }}
      />
    </div>
  );
}

// --- Sub-components ---

function ActionButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant={active ? "default" : "outline"}
      className="h-auto py-3 flex flex-col gap-1.5 items-center"
      onClick={onClick}
    >
      <Icon className="h-5 w-5" />
      <span className="text-xs">{label}</span>
    </Button>
  );
}

function BalanceView({ koshelok }: { koshelok: CashRegisterDetailed }) {
  return (
    <Card className="animate-slide-up">
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Wallet className="h-4 w-4 text-primary" />
          Koshelok ma'lumotlari
        </CardTitle>
        <CardDescription>Shaxsiy kassa holati</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="p-4 rounded-lg border bg-card">
            <p className="text-sm text-muted-foreground mb-1">Nomi</p>
            <p className="font-medium">{koshelok.name}</p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <p className="text-sm text-muted-foreground mb-1">Joriy balans</p>
            <p className="text-2xl font-bold text-primary">
              {formatMoney(koshelok.balance)} so'm
            </p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <p className="text-sm text-muted-foreground mb-1">Jami kirim</p>
            <p className="text-lg font-semibold text-green-600">
              +{formatMoney(koshelok.totalIn)} so'm
            </p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <p className="text-sm text-muted-foreground mb-1">Jami chiqim</p>
            <p className="text-lg font-semibold text-red-600">
              -{formatMoney(koshelok.totalOut)} so'm
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TransactionList({
  title,
  subtitle,
  transactions,
  loading,
  type,
}: {
  title: string;
  subtitle: string;
  transactions: CashTransaction[];
  loading: boolean;
  type: "IN" | "OUT";
}) {
  const isIn = type === "IN";

  return (
    <Card className="animate-slide-up">
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          {isIn ? (
            <TrendingUp className="h-4 w-4 text-success" />
          ) : (
            <TrendingDown className="h-4 w-4 text-destructive" />
          )}
          {title}
        </CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 bg-muted/50 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : transactions.length > 0 ? (
          transactions.map((t) => (
            <div
              key={t.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                isIn
                  ? "bg-success/5 border-success/10"
                  : "bg-destructive/5 border-destructive/10"
              }`}
            >
              <div>
                <p className="font-medium text-sm">
                  {t.note || (isIn ? "Kirim" : "Chiqim")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(t.createdAt).toLocaleString("uz-UZ")}
                </p>
              </div>
              <p
                className={`font-semibold ${
                  isIn ? "text-success" : "text-destructive"
                }`}
              >
                {isIn ? "+" : "-"}
                {formatMoney(t.amount)} so'm
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Hozircha ma'lumot yo'q
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function RequestMoneyDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [projectId, setProjectId] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  const { data: projectsData } = useApi(
    () => projectsApi.getAll({ limit: 100 }),
    [],
    { enabled: open }
  );

  const { mutate, loading } = useMutation((data: { projectId: string; amount: number; reason?: string }) =>
    cashRequestsApi.create(data)
  );

  const handleSubmit = async () => {
    if (!projectId || !amount) return;
    try {
      await mutate({
        projectId,
        amount: Number(amount),
        reason: reason || undefined,
      });
      setProjectId("");
      setAmount("");
      setReason("");
      onSuccess();
    } catch {
      // error is handled by useMutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pul so'rash</DialogTitle>
          <DialogDescription>
            Yangi pul so'rovi yarating
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Loyiha</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Loyihani tanlang" />
              </SelectTrigger>
              <SelectContent>
                {(projectsData?.data ?? []).map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Summa (so'm)</Label>
            <Input
              type="number"
              min={1}
              placeholder="Summani kiriting"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Sabab</Label>
            <Textarea
              placeholder="Sabab (ixtiyoriy)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Bekor qilish
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !projectId || !amount}
          >
            {loading ? "Yuborilmoqda..." : "Yuborish"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddExpenseDialog({
  open,
  onOpenChange,
  koshelokId,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  koshelokId?: string;
  onSuccess: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const { mutate, loading } = useMutation(
    (data: { cashRegisterId: string; type: "OUT"; amount: number; note?: string }) =>
      cashRegistersApi.createTransaction(data)
  );

  const handleSubmit = async () => {
    if (!koshelokId || !amount) return;
    try {
      await mutate({
        cashRegisterId: koshelokId,
        type: "OUT",
        amount: Number(amount),
        note: note || undefined,
      });
      setAmount("");
      setNote("");
      onSuccess();
    } catch {
      // error handled by useMutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rasxod qo'shish</DialogTitle>
          <DialogDescription>
            Yangi chiqim operatsiyasini kiriting
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Summa (so'm)</Label>
            <Input
              type="number"
              min={1}
              placeholder="Summani kiriting"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Izoh</Label>
            <Textarea
              placeholder="Izoh (ixtiyoriy)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Bekor qilish
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !amount || !koshelokId}
          >
            {loading ? "Saqlanmoqda..." : "Saqlash"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
