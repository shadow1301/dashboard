"use client";

import { useQuery } from "@tanstack/react-query";
import { Upload, FileText, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type UploadRecord = {
  id: string;
  filename: string;
  fileSize: number;
  rowCount: number;
  errorCount: number;
  status: string;
  createdAt: string;
};

const statusConfig: Record<string, { icon: typeof CheckCircle2; label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  success: { icon: CheckCircle2, label: "Success", variant: "default" },
  partial: { icon: AlertCircle, label: "Partial", variant: "secondary" },
  error: { icon: AlertCircle, label: "Failed", variant: "destructive" },
};

export default function UploadHistoryPage() {
  const { data: uploads, isLoading } = useQuery<UploadRecord[]>({
    queryKey: ["uploadHistory"],
    queryFn: async () => {
      const res = await fetch("/api/upload-history");
      if (!res.ok) throw new Error("Failed to fetch upload history");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!uploads?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Upload className="size-12 text-foreground-faint mb-4" />
        <h2 className="text-lg font-semibold text-foreground mb-2">No uploads yet</h2>
        <p className="text-foreground-muted text-sm">
          Your CSV upload history will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {uploads.map((upload) => {
        const config = statusConfig[upload.status] || statusConfig.error;
        const Icon = config.icon;
        return (
          <div
            key={upload.id}
            className="flex items-center justify-between rounded-lg border border-border bg-surface p-4"
          >
            <div className="flex items-center gap-3 min-w-0">
              <FileText className="size-5 text-foreground-faint shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{upload.filename}</p>
                <div className="flex items-center gap-3 text-xs text-foreground-faint mt-0.5">
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" />
                    {new Date(upload.createdAt).toLocaleDateString()}
                  </span>
                  <span>{upload.rowCount} rows</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {upload.errorCount > 0 && (
                <span className="text-xs text-foreground-faint">{upload.errorCount} errors</span>
              )}
              <Badge variant={config.variant} className="flex items-center gap-1">
                <Icon className="size-3" />
                {config.label}
              </Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
}
