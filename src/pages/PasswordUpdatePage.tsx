// src/pages/konsulent/PasswordPage.tsx
"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { accountApi } from "@/api/accountApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, KeyRound, ShieldCheck } from "lucide-react";

export default function PasswordPage() {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const minLen = 8;
  const atLeastMin = newPassword.trim().length >= minLen;
  const notSameAsCurrent = newPassword.trim() !== currentPassword.trim();
  const matchesConfirm = newPassword === confirm;

  const strengthHints = [
    { ok: atLeastMin, label: `At least ${minLen} characters` },
    { ok: notSameAsCurrent, label: "Different from current password" },
    { ok: matchesConfirm, label: "Confirmation matches" },
  ];

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword.trim() || !newPassword.trim() || !confirm.trim()) {
      toast.error("All fields are required.");
      return;
    }
    if (!atLeastMin) {
      toast.error(`New password must be at least ${minLen} characters.`);
      return;
    }
    if (!notSameAsCurrent) {
      toast.error("New password must be different from current password.");
      return;
    }
    if (!matchesConfirm) {
      toast.error("Confirmation does not match.");
      return;
    }

    try {
      setLoading(true);
      await accountApi.changePassword(currentPassword, newPassword);
      toast.success("Password updated successfully!");

      // ✅ redirect to konsulent homepage right away
      navigate("/konsulent");

      // if you prefer a short delay to let the toast breathe:
      // setTimeout(() => navigate("/konsulent"), 800);

      // clear local fields just in case
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
    } catch (err: any) {
      toast.error(err.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-xl mx-auto">
      <Card className="rounded-2xl border border-border shadow-sm">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-muted">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Update Password</h1>
              <p className="text-sm text-muted-foreground">
                This action is available for Konsulenter. Keep your account secure.
              </p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            {/* Current */}
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100"
                  onClick={() => setShowCurrent((s) => !s)}
                  aria-label={showCurrent ? "Hide current password" : "Show current password"}
                >
                  {showCurrent ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* New */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={`At least ${minLen} characters`}
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100"
                  onClick={() => setShowNew((s) => !s)}
                  aria-label={showNew ? "Hide new password" : "Show new password"}
                >
                  {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Confirm */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100"
                  onClick={() => setShowConfirm((s) => !s)}
                  aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Hints */}
            <div className="rounded-lg border border-border p-3 space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium">
                <ShieldCheck className="h-4 w-4" />
                Password requirements
              </div>
              <ul className="text-sm text-muted-foreground list-disc pl-6">
                {strengthHints.map((h) => (
                  <li key={h.label} className={h.ok ? "text-emerald-600" : ""}>
                    {h.label}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
