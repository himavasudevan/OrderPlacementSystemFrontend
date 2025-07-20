// components/OrderModal.tsx
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent,DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOrder } from "@/hooks/useOrders";
import { toast } from "sonner";

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit" | "view";
  order: any;
  refreshOrders: () => void;
}

const emptyService = {
  tjenester: "",
  tjenesteDato: "",
  addressFrom: "",
  addressTo: "",
  kommentar: "",
  pris: 0,
};

const OrderModal: React.FC<OrderModalProps> = ({ isOpen, onClose, mode, order, refreshOrders }) => {
  const { create, checkEmail ,update} = useOrder();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [services, setServices] = useState<any[]>([]);
  const [checking, setChecking] = useState(false);
  const [existingPerson, setExistingPerson] = useState<any>(null);
  const [isFormValid, setIsFormValid] = useState(false);
const [errors, setErrors] = useState<{
  email?: string;
  phone?: string;
  name?: string;
  services?: string[];
}>({});



  useEffect(() => {
  const fetchPersonIfNeeded = async () => {
    if (isOpen && mode === "create") {
      setEmail("");
      setName("");
      setPhone("");
      setServices([]);
      setExistingPerson(null); // Reset everything for new order
    } else if (isOpen && (mode === "edit" || mode === "view") && order) {
      setEmail(order.customerEmail);
      setName(order.customerName);
      setPhone(order.customerPhonenumber || "");

      const normalizedServices = (order.services || []).map((s: any) => ({
        ...s,
        tjenester: Array.isArray(s.tjenester) ? s.tjenester[0] : s.tjenester,
      }));
      setServices(normalizedServices);

      try {
        // 👇 Fetch the person based on email (get the kundeId from here)
        const person = await checkEmail(order.customerEmail);
        if (person?.id) {
          setExistingPerson(person); // 🎯 Set the person so you have their id in handleSubmit
          console.log("Fetched person for edit:", person);
        }
      } catch (error) {
        console.error("Failed to fetch person in edit mode:", error);
      }
    }
  };

  fetchPersonIfNeeded();
}, [isOpen, mode, order]);


useEffect(() => {
  const validationErrors = validateForm();

  // Check if there are any errors
  const hasErrors =
    Object.values(validationErrors).some((e) => {
      if (Array.isArray(e)) return e.some((msg) => msg);
      return e !== undefined;
    });

  setErrors(validationErrors);
  setIsFormValid(!hasErrors);
}, [email, phone, name, services]);


  const handleCheckEmail = async () => {
  if (!email) {
    toast.warning("Please enter an email first");
    return;
  }

  try {
    setChecking(true);

    const person = await checkEmail(email); // uses useOrders hook
    


    if (person && typeof person === "object") {
      setName(person.navn || "");
      setPhone(person.telefonnummer || "");
      setExistingPerson(person);
      toast.success("Customer found. Data filled.");
    } else {
      setName("");
      setPhone("");
       setExistingPerson(null);
      toast.info("No customer found. You can enter details.");
    }

    console.log("Email check result:", person); // helpful during development
  } catch (error: any) {
    console.error("Email check failed:", error);
    toast.error("Failed to check email");
  } finally {
    setChecking(false);
  }
};
const validateEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validatePhone = (phone: string) => {
  return /^\d{10}$/.test(phone);
};

const validateService = (service: any) => {
    const selectedDate = new Date(service.tjenesteDato);
  const now = new Date();
  // Set time to 00:00:00 to only compare dates
  now.setHours(0, 0, 0, 0);
  return (
    service.tjenester &&
    service.tjenesteDato &&
       selectedDate > now && 
    service.addressFrom &&
    (service.tjenester !== "Flytting" || service.addressTo) &&
    service.kommentar &&
    service.pris > 0
  );
};
const validateForm = () => {
  const newErrors: {
    email?: string;
    phone?: string;
    name?: string;
    services?: string[];
  } = {};

  if (!validateEmail(email)) newErrors.email = "Please enter a valid email.";
  if (!validatePhone(phone)) newErrors.phone = "Phone number must be 10 digits.";
  if (name.trim() === "") newErrors.name = "Name is required.";

  if (services.length === 0) {
    newErrors.services = ["At least one service must be added."];
  } else {
    newErrors.services = services.map((s) => {
      if (!s.tjenester) return "Service type is required.";
      if (!s.tjenesteDato) return "Service date is required.";
      const selectedDate = new Date(s.tjenesteDato);
const now = new Date();
now.setHours(0, 0, 0, 0);
if (selectedDate <= now) return "Service date must be in the future.";
      if (!s.addressFrom) return "From address is required.";
      if (s.tjenester === "Flytting" && !s.addressTo) return "To address is required for Flytting.";
      if (!s.kommentar) return "Comments are required.";
      if (!(s.pris > 0)) return "Price must be greater than zero.";
      return "";
    });
  }

  return newErrors;
};



  const handleAddService = () => {
    setServices((prev) => [...prev, { ...emptyService }]);
  };

  const handleServiceChange = (index: number, field: string, value: any) => {
    setServices((prev) =>
      prev.map((s, i) =>
        i === index
          ? {
              ...s,
              [field]: value,
              ...(field === "tjenester" && (value === "Flytting" ? {} : { addressTo: "" })),
            }
          : s
      )
    );
  };

 

const handleSubmit = async () => {
  try {
    const isExisting = existingPerson && existingPerson.id;
    const serviceTypeMap: Record<string, number> = {
      Flytting: 1,
      Rengjøring: 2,
      Pakking: 3,
    };

    const mappedServices = services.map((s) => ({
      tjenesteDato: s.tjenesteDato,
      addressFrom: s.addressFrom,
      addressTo: s.addressTo,
      kommentar: s.kommentar,
      pris: s.pris,
      tjenesteTypeId: serviceTypeMap[s.tjenester],
    }));

    const newOrder = {
      konsulentid: 1,
      kundeId: null,
      kundeInfo: {
        navn: name,
        telefonnummer: phone,
        epost: email,
        roleId: 2,
        
      },
      tjenester: mappedServices,
    };

    if (isExisting) {
      newOrder.kundeId = existingPerson.id;
    }

    if (mode === "edit" && order?.id) {
      await update(order.id, newOrder); // 👈 UPDATE CALL
      toast.success("Order updated successfully!");
    } else {
      await create(newOrder); // 👈 CREATE CALL
      toast.success("Order created successfully!");
    }


    onClose();
    refreshOrders();
  } catch (error) {
    toast.error("Failed to submit order");
    console.error("Order submit failed:", error);
  }
};

const getTomorrowDateString = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0]; // "YYYY-MM-DD"
};


 return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
  <DialogTitle>
    {mode === "edit" && "Edit Order"}
    {mode === "view" && "Order Details"}
    {mode === "create" && "Create Order"}
  </DialogTitle>
  <DialogDescription>
    {mode === "view"
      ? "Here are the full details of this order."
      : "Fill in the order details below."}
  </DialogDescription>
</DialogHeader>

        <div className="space-y-4">
          {/* Customer info inputs */}
          <div className="flex gap-2 items-end">
            {/* Email + check */}
            <div className="flex-1">
              <Label>Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} disabled={mode !== "create"} />
              {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
            </div>
           {mode === "create" && (
  <Button onClick={handleCheckEmail} disabled={checking}>
    {checking ? "Checking..." : "Check Email"}
  </Button>
)}

          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} disabled={mode === "view"} />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} disabled={mode === "view"} />
              {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
            </div>
          </div>

          {/* Scrollable Services container */}
          <div
            className="border rounded-xl p-4 max-h-96 overflow-y-auto space-y-4 bg-white shadow-sm"
            style={{ scrollbarWidth: "thin", scrollbarColor: "#cbd5e1 transparent" }}
          >
            {services.length === 0 && (
              <p className="text-gray-500 italic">No services added yet. Click "Add Service" to get started.</p>
            )}

            {services.map((service, idx) => (
              <div key={idx} className="border rounded-lg p-4 space-y-2 bg-gray-50 relative">
                <Label className="block font-semibold mb-1">Service {idx + 1}</Label>
                 {/* Remove button */}
    {mode !== "view" && (
      <button
        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
        onClick={() => {
          setServices(prev => prev.filter((_, i) => i !== idx));
        }}
        aria-label={`Remove service ${idx + 1}`}
      >
        &times;
      </button>
    )}

                <Label className="block">Service Type</Label>
                <Select
                  value={service.tjenester}
                  onValueChange={(val) => handleServiceChange(idx, "tjenester", val)}
                  disabled={mode === "view"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Flytting">Flytting</SelectItem>
                    <SelectItem value="Rengjøring">Rengjøring</SelectItem>
                    <SelectItem value="Pakking">Pakking</SelectItem>
                  </SelectContent>
                </Select>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={service.tjenesteDato}
                      onChange={(e) => handleServiceChange(idx, "tjenesteDato", e.target.value)}
                      disabled={mode === "view"}
                      min={getTomorrowDateString()}
                    />
                  </div>
                  <div>
                    <Label>From Address</Label>
                    <Input
                      value={service.addressFrom}
                      onChange={(e) => handleServiceChange(idx, "addressFrom", e.target.value)}
                      disabled={mode === "view"}
                    />
                  </div>
                  {service.tjenester === "Flytting" && (
                    <div>
                      <Label>To Address</Label>
                      <Input
                        value={service.addressTo}
                        onChange={(e) => handleServiceChange(idx, "addressTo", e.target.value)}
                        disabled={mode === "view"}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Label>Comments</Label>
                  <Input
                    value={service.kommentar}
                    onChange={(e) => handleServiceChange(idx, "kommentar", e.target.value)}
                    disabled={mode === "view"}
                  />
                </div>
                <div>
                  <Label>Price</Label>
                  <Input
                    type="number"
                    value={service.pris}
                    onChange={(e) => handleServiceChange(idx, "pris", parseFloat(e.target.value))}
                    disabled={mode === "view"}
                  />
                </div>

                {errors.services && errors.services[idx] && (
                  <p className="text-red-600 text-sm mt-1">{errors.services[idx]}</p>
                )}
              </div>
            ))}
          </div>

          {mode !== "view" && (
            <Button type="button" variant="outline" onClick={handleAddService}>
              Add Service
            </Button>
          )}

          {mode !== "view" && (
            <Button className="bg-blue-600 text-white" onClick={handleSubmit} disabled={!isFormValid}>
              {mode === "edit" ? "Update Order" : "Create Order"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderModal;