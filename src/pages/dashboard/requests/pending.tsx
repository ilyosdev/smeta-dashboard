import { useState } from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ClipboardCheck,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import { AlertCard } from "@/components/dashboard/alert-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const pendingRequests = [
  {
    id: "A7B3C9",
    product: "Sement M400",
    quantity: 1000,
    unit: "kg",
    unitPrice: 1200,
    amount: 1200000,
    isOverBudget: true,
    overPercent: 17.6,
    date: "2024-01-15 14:32",
    user: "Abdullayev Jasur",
    role: "Snabjenets",
    project: "Navoiy 108-uy",
    subProject: "A blok",
    smeta: "Qurilish smetasi",
    smetaData: {
      total: 5000,
      used: 4150,
      remaining: 850,
    },
    note: "Zaxira uchun kerak, keyingi hafta katta ishlar boshlanadi",
  },
  {
    id: "B8C4D0",
    product: "G'isht M100",
    quantity: 5000,
    unit: "ta",
    unitPrice: 800,
    amount: 4000000,
    isOverBudget: false,
    date: "2024-01-15 13:15",
    user: "Rahimov Bekzod",
    role: "Smetachi",
    project: "Navoiy 108-uy",
    subProject: "B blok",
    smeta: "Qurilish smetasi",
    smetaData: {
      total: 50000,
      used: 37500,
      remaining: 12500,
    },
    note: "Devor uchun zarur",
  },
  {
    id: "F2G8H4",
    product: "Sim elektr 2.5mm",
    quantity: 500,
    unit: "metr",
    unitPrice: 3500,
    amount: 1750000,
    isOverBudget: false,
    date: "2024-01-15 11:20",
    user: "Toshmatov Sardor",
    role: "Ishchi",
    project: "Chilonzor 5-mavze",
    subProject: "C blok",
    smeta: "Elektr montaj",
    smetaData: {
      total: 2000,
      used: 1200,
      remaining: 800,
    },
    note: "",
  },
];

const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  return `${(value / 1000).toFixed(0)}K`;
};

const formatNumber = (value: number) => {
  return new Intl.NumberFormat("uz-UZ").format(value);
};

export default function PendingApprovalsPage() {
  const [selectedRequest, setSelectedRequest] = useState<typeof pendingRequests[0] | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const handleApprove = (request: typeof pendingRequests[0]) => {
    setDialogOpen(false);
  };

  const handleReject = () => {
    setRejectDialogOpen(false);
    setDialogOpen(false);
    setRejectReason("");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardCheck className="h-6 w-6 text-primary" />
            Kutilayotgan tasdiqlar
          </h1>
          <p className="text-muted-foreground">
            {pendingRequests.length} ta so'rov sizning tasdiqingizni kutmoqda
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-warning/10 text-warning px-3 py-1.5">
            <Clock className="h-4 w-4 mr-1" />
            {pendingRequests.length} ta kutmoqda
          </Badge>
        </div>
      </div>

      <div className="grid gap-4">
        {pendingRequests.map((request, index) => (
          <Card
            key={request.id}
            className={`overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer group animate-slide-up ${
              request.isOverBudget
                ? "border-l-4 border-l-warning hover:border-warning/50"
                : "hover:border-primary/20"
            }`}
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => {
              setSelectedRequest(request);
              setDialogOpen(true);
            }}
          >
            <CardContent className="p-5">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-muted-foreground">
                          #{request.id}
                        </span>
                        {request.isOverBudget && (
                          <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            +{request.overPercent}% oshiq
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold mt-1 group-hover:text-primary transition-colors">
                        {request.product}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {request.project} / {request.subProject} / {request.smeta}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">
                        {formatCurrency(request.amount)} so'm
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatNumber(request.quantity)} {request.unit}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-[10px] font-semibold text-primary">
                          {request.user.split(" ").map((n) => n[0]).join("")}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-xs">{request.user}</p>
                        <p className="text-[10px] text-muted-foreground">{request.role}</p>
                      </div>
                    </div>
                    <span className="text-muted-foreground">|</span>
                    <span className="text-muted-foreground">{request.date}</span>
                  </div>

                  {request.note && (
                    <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                      "{request.note}"
                    </p>
                  )}
                </div>

                <div className="lg:w-64 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Smeta holati</span>
                    <span className="font-medium">
                      {formatNumber(request.smetaData.used)}/{formatNumber(request.smetaData.total)}{" "}
                      {request.unit}
                    </span>
                  </div>
                  <ProgressBar
                    value={request.smetaData.used + request.quantity}
                    max={request.smetaData.total}
                    size="sm"
                    showLabel={false}
                  />
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRequest(request);
                        setRejectDialogOpen(true);
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Rad
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-success hover:bg-success/90"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApprove(request);
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Tasdiqlash
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {pendingRequests.length === 0 && (
        <Card className="p-12">
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
            </div>
            <h3 className="text-lg font-semibold">Hech qanday kutilayotgan so'rov yo'q</h3>
            <p className="text-muted-foreground">Barcha so'rovlar ko'rib chiqilgan</p>
          </div>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          {selectedRequest && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  So'rov #{selectedRequest.id}
                </DialogTitle>
                <DialogDescription>
                  {selectedRequest.user} tomonidan yuborilgan
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {selectedRequest.isOverBudget && (
                  <AlertCard
                    type="warning"
                    title="Ogohlantirish"
                    description={`Bu so'rov smeta chegarasidan ${selectedRequest.overPercent}% oshadi`}
                  />
                )}

                <Card className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-lg">{selectedRequest.product}</h4>
                      <p className="font-bold text-primary">
                        {formatNumber(selectedRequest.amount)} so'm
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Miqdor:</span>
                        <span className="ml-2 font-medium">
                          {formatNumber(selectedRequest.quantity)} {selectedRequest.unit}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Birlik narxi:</span>
                        <span className="ml-2 font-medium">
                          {formatNumber(selectedRequest.unitPrice)} so'm
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">SMETA HOLATI</p>
                  <Card className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Jami:</span>
                        <span>{formatNumber(selectedRequest.smetaData.total)} {selectedRequest.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ishlatilgan:</span>
                        <span>{formatNumber(selectedRequest.smetaData.used)} {selectedRequest.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Qolgan:</span>
                        <span>{formatNumber(selectedRequest.smetaData.remaining)} {selectedRequest.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">So'rov:</span>
                        <span className="text-primary font-medium">
                          {formatNumber(selectedRequest.quantity)} {selectedRequest.unit}
                        </span>
                      </div>
                    </div>
                    <ProgressBar
                      value={selectedRequest.smetaData.used + selectedRequest.quantity}
                      max={selectedRequest.smetaData.total}
                    />
                  </Card>
                </div>

                <div className="text-sm space-y-1">
                  <p>
                    <span className="text-muted-foreground">Manzil:</span>{" "}
                    <span className="font-medium">
                      {selectedRequest.project} - {selectedRequest.subProject} - {selectedRequest.smeta}
                    </span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">So'ragan:</span>{" "}
                    <span className="font-medium">
                      {selectedRequest.user} ({selectedRequest.role})
                    </span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Sana:</span>{" "}
                    <span className="font-medium">{selectedRequest.date}</span>
                  </p>
                </div>

                {selectedRequest.note && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Izoh</p>
                    <p className="text-sm bg-muted/50 p-3 rounded-lg">"{selectedRequest.note}"</p>
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  className="text-destructive hover:text-destructive"
                  onClick={() => {
                    setRejectDialogOpen(true);
                  }}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Rad etish
                </Button>
                <Button
                  className="bg-success hover:bg-success/90"
                  onClick={() => handleApprove(selectedRequest)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Tasdiqlash
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              So'rovni rad etish
            </DialogTitle>
            <DialogDescription>
              #{selectedRequest?.id} - {selectedRequest?.product}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Rad etish sababi</label>
              <Textarea
                placeholder="Sabab kiriting..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="mt-2"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Bekor qilish
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason.trim()}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Rad etish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
