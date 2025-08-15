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

interface ConfirmModalProps {
  open: boolean;
  title?: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal = ({
  open,
  title = "Are you sure?",
  description,
  onConfirm,
  onCancel,
}: ConfirmModalProps) => (
  <Dialog open={open} onOpenChange={(o) => { if (!o) onCancel(); }}>
    {/* DialogContent already uses theme tokens; we add subtle sizing + border tokens */}
    <DialogContent className="sm:max-w-md rounded-xl border border-border bg-card text-card-foreground">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        {description && (
          <DialogDescription className="text-muted-foreground">
            {description}
          </DialogDescription>
        )}
      </DialogHeader>

      <DialogFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        {/* Use semantic destructive variant so it looks right in both themes */}
        <Button variant="destructive" onClick={onConfirm}>
          Delete
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
