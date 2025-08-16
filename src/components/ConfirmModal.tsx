"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch"; 

interface ConfirmModalProps {
  open: boolean;
  title?: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;

  // 👇 NEW (all optional/controlled)
  confirmLabel?: string;
  cancelLabel?: string;
  showRefundToggle?: boolean;
  refundChecked?: boolean;
  onRefundChange?: (checked: boolean) => void;
  refundLabel?: string;
}

export const ConfirmModal = ({
  open,
  title = "Are you sure?",
  description,
  onConfirm,
  onCancel,

  // NEW
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  showRefundToggle = false,
  refundChecked = false,
  onRefundChange,
  refundLabel = "Refund payment to customer",
}: ConfirmModalProps) => (
  <Dialog open={open} onOpenChange={(o) => { if (!o) onCancel(); }}>
    <DialogContent className="sm:max-w-md rounded-xl border border-border bg-card text-card-foreground">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        {description && (
          <DialogDescription className="text-muted-foreground">
            {description}
          </DialogDescription>
        )}
      </DialogHeader>

      {showRefundToggle && (
        <div className="mt-2 flex items-center justify-between gap-4 rounded-md border border-border bg-muted px-3 py-2">
          <div className="flex-1">
            <div className="font-medium">Refund</div>
            <div className="text-sm text-muted-foreground">
              {refundLabel}
            </div>
          </div>
          <Switch checked={!!refundChecked} onCheckedChange={onRefundChange} />
        </div>
      )}

      <DialogFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button variant="destructive" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
