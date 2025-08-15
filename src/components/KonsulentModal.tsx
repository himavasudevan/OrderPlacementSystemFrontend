"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { CreateKonsulentDTO, PersonDTO } from "@/api/personApi";

type CreateProps = {
  mode: "create";
  open: boolean;
  onClose: () => void;
  onSave: (data: CreateKonsulentDTO) => Promise<void>;
  initialData?: undefined;
};

type EditProps = {
  mode: "edit";
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<PersonDTO>) => Promise<void>;
  initialData: PersonDTO;
};

type KonsulentModalProps = CreateProps | EditProps;

export function KonsulentModal(props: KonsulentModalProps) {
  const { mode, open, onClose, onSave } = props;

  // local form state
  const [navn, setNavn] = useState("");
  const [epost, setEpost] = useState("");
  const [telefonnummer, setTelefonnummer] = useState("");
  const [password, setPassword] = useState(""); // only used in create mode
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (mode === "edit") {
      const { initialData } = props;
      setNavn(initialData.navn ?? "");
      setEpost(initialData.epost ?? "");
      setTelefonnummer(initialData.telefonnummer ?? "");
      setPassword(""); // not used
    } else {
      setNavn("");
      setEpost("");
      setTelefonnummer("");
      setPassword("");
    }
    // re-init when modal opens/closes or mode changes
  }, [open, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const validatePhone = (v: string) => /^\d{10}$/.test(v);
  const validatePassword = (v: string) => v.trim().length >= 8;

  const handleSubmit = async () => {
    if (!navn.trim() || !epost.trim() || !telefonnummer.trim()) {
      toast.error("Name, email, and phone are required.");
      return;
    }
    if (!validateEmail(epost)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!validatePhone(telefonnummer)) {
      toast.error("Phone number must contain exactly 10 digits.");
      return;
    }
    if (mode === "create" && !validatePassword(password)) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    try {
      setIsSaving(true);
      if (mode === "create") {
        await onSave({
          navn: navn.trim(),
          epost: epost.trim(),
          telefonnummer: telefonnummer.trim(),
          password: password, // server will hash
          // roleId optional; API enforces konsulent role if omitted
        });
      } else {
        await onSave({
          navn: navn.trim(),
          epost: epost.trim(),
          telefonnummer: telefonnummer.trim(),
        });
      }
      onClose();
    } catch (error) {
      // parent handles toast; just log for dev
      // eslint-disable-next-line no-console
      console.error("KonsulentModal submit error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-md rounded-xl border border-border bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit Konsulent" : "Create Konsulent"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="navn">Name</Label>
            <Input
              id="navn"
              name="navn"
              value={navn}
              onChange={(e) => setNavn(e.target.value)}
              placeholder="Name"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="epost">Email</Label>
            <Input
              id="epost"
              name="epost"
              value={epost}
              onChange={(e) => setEpost(e.target.value)}
              placeholder="Email"
              readOnly={mode === "edit"}
              className={mode === "edit" ? "bg-muted/50 text-muted-foreground cursor-not-allowed" : ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefonnummer">Phone Number</Label>
            <Input
              id="telefonnummer"
              name="telefonnummer"
              value={telefonnummer}
              onChange={(e) => setTelefonnummer(e.target.value)}
              placeholder="Phone Number"
              inputMode="numeric"
              pattern="\d{10}"
            />
          </div>

          {mode === "create" && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 characters"
              />
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving
              ? mode === "edit"
                ? "Updating..."
                : "Creating..."
              : mode === "edit"
              ? "Update"
              : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

