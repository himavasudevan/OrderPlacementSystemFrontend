import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";  

export function CustomerModal({ open, onClose, onSave, initialData }: {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>; // assuming onSave is async
  initialData?: any;
}) {
  const [form, setForm] = useState({ navn: "", epost: "", telefonnummer: "" });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        navn: initialData.navn,
        epost: initialData.epost,
        telefonnummer: initialData.telefonnummer,
      });
    } else {
      setForm({ navn: "", epost: "", telefonnummer: "" });
    }
  }, [initialData, open]);

  const handleChange = (e: any) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateEmail = (epost: string) => {
    // simple email regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(epost);
  };

  const validatePhoneNumber = (telefonnummer: string) => {
    // check if it's exactly 10 digits
    return /^\d{10}$/.test(telefonnummer);
  };

  const handleSubmit = async () => {
    if (!form.navn.trim() || !form.epost.trim() || !form.telefonnummer.trim()) {
  toast.error("All fields are required");
  return;
}


    if (!validateEmail(form.epost)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (!validatePhoneNumber(form.telefonnummer)) {
      toast.error("Phone number must contain exactly 10 digits.");
      return;
    }

    try {
      setIsSaving(true);
      await onSave(form);
      toast.success(initialData ? "Customer updated successfully!" : "Customer created successfully!");

      setForm({ navn: "", epost: "", telefonnummer: "" });
      onClose();
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Customer" : "Create Customer"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input name="navn" value={form.navn} onChange={handleChange} placeholder="Name" />
          <Input name="epost" value={form.epost} onChange={handleChange} placeholder="Email" />
          <Input name="telefonnummer" value={form.telefonnummer} onChange={handleChange} placeholder="Phone Number" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? (initialData ? "Updating..." : "Creating...") : (initialData ? "Update" : "Create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
