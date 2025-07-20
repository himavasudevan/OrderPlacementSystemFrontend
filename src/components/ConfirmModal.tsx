"use client";

import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmModalProps {
  open: boolean;
  title?: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal = ({ open, title = "Are you sure?", description, onConfirm, onCancel }: ConfirmModalProps) => (
  <Dialog open={open} onOpenChange={(o) => { if (!o) onCancel(); }}>
    <DialogContent className="rounded-xl">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        {description && <DialogDescription>{description}</DialogDescription>}
      </DialogHeader>
      <DialogFooter className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button className="bg-red-600 text-white hover:bg-red-700" onClick={onConfirm}>Delete</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
