"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Upload, FileText, AlertCircle, CheckCircle2, Loader2, Database, X, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";

type CsvRow = Record<string, string>;
type UploadStatus = "idle" | "parsing" | "preview" | "uploading" | "confirm" | "error";

export default function UploadPage() {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [allRows, setAllRows] = useState<CsvRow[]>([]);
  const [previewRows, setPreviewRows] = useState<CsvRow[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [columns, setColumns] = useState<string[]>([]);
  const [filename, setFilename] = useState("");
  const [error, setError] = useState("");
  const [showCancel, setShowCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const cancelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  const parseFile = useCallback(async (file: File) => {
    if (!file.name.endsWith(".csv")) {
      setError("Please select a CSV file");
      return;
    }

    setFilename(file.name);
    setStatus("parsing");
    setError("");

    try {
      const text = await file.text();
      const Papa = (await import("papaparse")).default;
      const result = Papa.parse<CsvRow>(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h) => h.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_"),
      });

      if (result.errors.length > 0) {
        const firstError = result.errors[0];
        if (firstError.type === "FieldMismatch" && result.data.length > 0) {
          const colCount = Math.max(
            ...result.data.map((r) => Object.keys(r).length),
          );
          if (colCount <= 1) {
            setError("Could not detect columns. Check your CSV formatting.");
            setStatus("idle");
            return;
          }
        }
      }

      if (result.data.length === 0) {
        setError("CSV file is empty");
        setStatus("idle");
        return;
      }

      setAllRows(result.data);
      setPreviewRows(result.data.slice(0, 5));
      setTotalRows(result.data.length);
      setColumns(result.meta.fields ?? []);
      setStatus("preview");
    } catch {
      setError("Failed to read file");
      setStatus("idle");
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) parseFile(file);
    },
    [parseFile],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) parseFile(file);
    },
    [parseFile],
  );

  const handleUpload = async () => {
    setStatus("uploading");
    setError("");
    setShowCancel(false);

    const abort = new AbortController();
    abortRef.current = abort;

    cancelTimerRef.current = setTimeout(() => {
      setShowCancel(true);
    }, 60000);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename, rows: allRows }),
        signal: abort.signal,
      });

      if (cancelTimerRef.current) clearTimeout(cancelTimerRef.current);
      abortRef.current = null;

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await res.json();
      setSuccessCount(data.count ?? totalRows);

      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["vehicleCount"] });

      setStatus("confirm");
    } catch (err) {
      if (cancelTimerRef.current) clearTimeout(cancelTimerRef.current);
      abortRef.current = null;

      if (err instanceof DOMException && err.name === "AbortError") {
        setStatus("idle");
        return;
      }

      setError(err instanceof Error ? err.message : "Upload failed");
      setStatus("preview");
    }
  };

  const handleCancelUpload = () => {
    setCancelling(true);
    if (abortRef.current) {
      abortRef.current.abort();
    }
  };

  const handleGoToFleet = () => {
    router.push("/fleet");
  };

  const reset = () => {
    setStatus("idle");
    setAllRows([]);
    setPreviewRows([]);
    setTotalRows(0);
    setSuccessCount(0);
    setColumns([]);
    setFilename("");
    setError("");
  };

  useEffect(() => {
    return () => {
      if (cancelTimerRef.current) clearTimeout(cancelTimerRef.current);
    };
  }, []);

  if (status === "uploading") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-6 max-w-sm text-center">
          <div className="relative">
            <Loader2 className="size-16 animate-spin text-primary" />
            <Database className="size-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Processing upload</h2>
          <p className="text-foreground-muted">
            Inserting {totalRows} vehicle records into the database. This may take up to a few minutes for large files.
          </p>
          <div className="w-48 h-1.5 bg-surface-raised rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: "60%" }} />
          </div>
          {showCancel && !cancelling && (
            <button
              onClick={handleCancelUpload}
              className="flex items-center gap-2 text-sm text-foreground-faint hover:text-error transition-colors mt-2"
            >
              <Ban className="size-4" />
              Cancel upload
            </button>
          )}
          {cancelling && (
            <p className="text-sm text-foreground-faint">Cancelling...</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-1">Import vehicle data</h2>
          <p className="text-sm text-foreground-muted">
            Upload a CSV file with battery health data for your fleet.
          </p>
        </div>

        {status === "idle" && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById("csv-input")?.click()}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
              dragOver
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-surface-raised"
            }`}
          >
            <Upload className="size-10 text-foreground-faint mx-auto mb-4" />
            <p className="text-foreground font-medium mb-1">
              Drop your CSV here or click to browse
            </p>
            <p className="text-sm text-foreground-faint">
              Expects columns: vehicle_id, vehicle_model, battery_type, soh_percent, vehicle_age, etc.
            </p>
            <input
              id="csv-input"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileInput}
            />
          </div>
        )}

        {status === "parsing" && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-8 animate-spin text-primary" />
            <span className="ml-3 text-foreground-muted">Parsing CSV...</span>
          </div>
        )}

        {status === "preview" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-foreground">
                <FileText className="size-4" />
                <span className="font-medium">{filename}</span>
                <span className="text-foreground-faint">— {totalRows} rows</span>
              </div>
              <button onClick={reset} className="text-foreground-faint hover:text-foreground">
                <X className="size-4" />
              </button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-raised border-b border-border">
                    {columns.slice(0, 8).map((col) => (
                      <th key={col} className="px-3 py-2 text-left text-foreground-muted font-medium whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                    {columns.length > 8 && (
                      <th className="px-3 py-2 text-foreground-faint">+{columns.length - 8} more</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      {columns.slice(0, 8).map((col) => (
                        <td key={col} className="px-3 py-2 text-foreground truncate max-w-32">
                          {row[col] ?? ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-error bg-error/10 px-3 py-2 rounded-lg">
                <AlertCircle className="size-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={handleUpload} disabled={totalRows === 0}>
                Upload {totalRows} {totalRows === 1 ? "row" : "rows"}
              </Button>
              <Button variant="ghost" onClick={reset}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={status === "confirm"} onOpenChange={(open) => { if (!open) reset(); }}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <div className="flex flex-col items-center gap-3 text-center">
              <CheckCircle2 className="size-12 text-success" />
              <DialogTitle className="text-lg">Upload complete</DialogTitle>
              <DialogDescription>
                {successCount} vehicle records imported successfully.
              </DialogDescription>
            </div>
          </DialogHeader>
          <div className="text-sm text-foreground-muted text-center">
            Your fleet data is ready. View it on the fleet page or return to the dashboard for insights.
          </div>
          <DialogFooter className="sm:justify-center">
            <Button onClick={handleGoToFleet}>
              Go to fleet
            </Button>
            <Button variant="outline" onClick={reset}>
              Upload another file
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
