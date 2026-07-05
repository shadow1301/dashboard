"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle2, Loader2, Trash2, UserX, Lock } from "lucide-react";

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type PageStatus = "idle" | "deleting-data" | "data-deleted" | "deleting-account";

export default function SettingsPage() {
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [pageStatus, setPageStatus] = useState<PageStatus>("idle");
  const [dataDialogOpen, setDataDialogOpen] = useState(false);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const queryClient = useQueryClient();

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update password");
      }

      setPasswordSuccess(true);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password updated");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update password";
      toast.error(msg);
      setPasswordError(msg);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteData = async () => {
    setPageStatus("deleting-data");
    setError("");
    const res = await fetch("/api/user/data", { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error || "Failed to delete data");
      setError(data.error || "Failed to delete data");
      setPageStatus("idle");
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    queryClient.invalidateQueries({ queryKey: ["alerts"] });
    queryClient.invalidateQueries({ queryKey: ["vehicleCount"] });
    setDataDialogOpen(false);
    setPageStatus("data-deleted");
    toast.success("All data deleted");
  };

  const handleDeleteAccount = async () => {
    setPageStatus("deleting-account");
    setError("");
    const res = await fetch("/api/user/account", { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to delete account");
      setPageStatus("idle");
      return;
    }
    await signOut({ callbackUrl: "/login" });
  };

  const isBusy = pageStatus !== "idle";

  return (
    <div className="max-w-2xl mx-auto space-y-10">
      {/* Change Password */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <Lock className="size-5 text-foreground-muted" />
          <h2 className="text-lg font-semibold text-foreground">Change password</h2>
        </div>
        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-sm">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Current password</label>
            <Input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))}
              disabled={passwordLoading}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">New password</label>
            <Input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))}
              disabled={passwordLoading}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Confirm new password</label>
            <Input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))}
              disabled={passwordLoading}
            />
          </div>

          {passwordError && (
            <div className="flex items-center gap-2 text-sm text-error bg-error/10 px-3 py-2 rounded-lg">
              <AlertCircle className="size-4 shrink-0" />
              {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div className="text-sm text-success bg-success/10 px-3 py-2 rounded-lg">
              Password updated successfully
            </div>
          )}

          <Button type="submit" disabled={passwordLoading}>
            {passwordLoading ? "Updating..." : "Update password"}
          </Button>
        </form>
      </section>

      <hr className="border-border" />

      {pageStatus === "data-deleted" && (
        <div className="flex items-center gap-2 text-sm text-success bg-success/10 px-4 py-3 rounded-lg">
          <CheckCircle2 className="size-5 shrink-0" />
          <span>All data deleted successfully. Your fleet pages will now reflect the change.</span>
        </div>
      )}

      {/* Delete All Data */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <Trash2 className="size-5 text-error" />
          <h2 className="text-lg font-semibold text-foreground">Delete all data</h2>
        </div>
        <p className="text-sm text-foreground-muted mb-4">
          Remove all vehicles, alerts, and upload history. Your account will remain active.
        </p>
        <Dialog open={dataDialogOpen} onOpenChange={setDataDialogOpen}>
          <DialogTrigger render={<Button variant="destructive" disabled={isBusy}>Delete all data</Button>} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete all data?</DialogTitle>
              <DialogDescription>
                This will permanently remove all vehicles, alerts, and upload records from your account. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-start gap-2 rounded-lg bg-error/10 p-3 text-sm text-error">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>All fleet data, analysis results, and upload history will be erased.</span>
            </div>
            <DialogFooter>
              <Button
                variant="destructive"
                disabled={isBusy}
                onClick={handleDeleteData}
              >
                {pageStatus === "deleting-data" ? (
                  <><Loader2 className="size-4 animate-spin mr-2" />Deleting...</>
                ) : (
                  "Yes, delete everything"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>

      <hr className="border-border" />

      {/* Delete Account */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <UserX className="size-5 text-error" />
          <h2 className="text-lg font-semibold text-foreground">Delete account</h2>
        </div>
        <p className="text-sm text-foreground-muted mb-4">
          Permanently delete your account and all associated data. You will be signed out immediately.
        </p>
        <Dialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen}>
          <DialogTrigger render={<Button variant="destructive" disabled={isBusy}>Delete account</Button>} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete account?</DialogTitle>
              <DialogDescription>
                This will permanently delete your account, all vehicles, alerts, upload history, and active sessions. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-start gap-2 rounded-lg bg-error/10 p-3 text-sm text-error">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>
                You will lose access to all fleet data. There is no recovery option.
              </span>
            </div>
            <DialogFooter>
              <Button
                variant="destructive"
                disabled={isBusy}
                onClick={handleDeleteAccount}
              >
                {pageStatus === "deleting-account" ? (
                  <><Loader2 className="size-4 animate-spin mr-2" />Deleting...</>
                ) : (
                  "Yes, delete my account"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>

      {error && (
        <div className="flex items-center gap-2 text-sm text-error bg-error/10 px-3 py-2 rounded-lg">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
