"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  saveAddress,
  deleteAddress,
  setDefaultAddress,
} from "@/lib/address-actions";

type Address = {
  id: string;
  title: string | null;
  fullName: string;
  phone: string;
  street: string;
  apartment: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

type AddressManagerProps = {
  addresses: Address[];
};

export function AddressManager({ addresses }: AddressManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [detectError, setDetectError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const formData = new FormData(event.currentTarget);
    if (editingAddress) {
      formData.append("id", editingAddress.id);
    }

    startTransition(async () => {
      const result = await saveAddress({}, formData);
      if (result.error) {
        setFormError(result.error);
      } else {
        setIsAdding(false);
        setEditingAddress(null);
      }
    });
  }

  function handleSetDefault(id: string) {
    startTransition(async () => {
      await setDefaultAddress(id);
    });
  }

  function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this address?")) {
      startTransition(async () => {
        await deleteAddress(id);
      });
    }
  }

  const INDIAN_STATES = [
    "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
    "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa",
    "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka",
    "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
    "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim",
    "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
  ];

  function handleDetectLocation() {
    if (!navigator.geolocation) {
      setDetectError("Geolocation is not supported by your browser.");
      return;
    }

    setDetecting(true);
    setDetectError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          // Call our own server-side proxy — required for Nominatim ToS compliance
          // and to avoid browser CORS / rate-limit issues.
          const res = await fetch(
            `/api/geocode?lat=${latitude.toFixed(6)}&lon=${longitude.toFixed(6)}`
          );

          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || `Server error ${res.status}`);
          }

          const addr = await res.json();

          const form = document.getElementById("address-form") as HTMLFormElement;
          if (form) {
            const streetInput = form.elements.namedItem("street") as HTMLInputElement;
            const cityInput = form.elements.namedItem("city") as HTMLInputElement;
            const stateSelect = form.elements.namedItem("state") as HTMLSelectElement;
            const postalCodeInput = form.elements.namedItem("postalCode") as HTMLInputElement;

            if (streetInput && addr.street) streetInput.value = addr.street;
            if (cityInput && addr.city) cityInput.value = addr.city;
            if (postalCodeInput && addr.postalCode) postalCodeInput.value = addr.postalCode;

            if (stateSelect && addr.state) {
              const normalized = addr.state.toLowerCase();
              const match =
                INDIAN_STATES.find((s) => s.toLowerCase() === normalized) ||
                INDIAN_STATES.find((s) => normalized.includes(s.toLowerCase())) ||
                INDIAN_STATES.find((s) =>
                  s.toLowerCase().startsWith(normalized.slice(0, 4))
                );
              if (match) stateSelect.value = match;
            }
          }
        } catch (err) {
          console.error("[address] Location detect failed:", err);
          setDetectError(
            err instanceof Error
              ? err.message
              : "Failed to auto-detect address. Please enter details manually."
          );
        } finally {
          setDetecting(false);
        }
      },
      (err) => {
        setDetecting(false);
        if (err.code === err.PERMISSION_DENIED) {
          setDetectError(
            "Location permission denied. Enable it in your browser settings."
          );
        } else if (err.code === err.TIMEOUT) {
          setDetectError("Location request timed out. Try again.");
        } else {
          setDetectError("Could not detect location. Enter your address manually.");
        }
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  }

  if (isAdding || editingAddress) {
    const defaultVals = editingAddress || {
      title: "Home",
      fullName: "",
      phone: "",
      street: "",
      apartment: "",
      city: "",
      state: "Karnataka",
      postalCode: "",
      isDefault: false,
    };

    return (
      <div className="rounded-sm border border-border bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex justify-between items-center mb-6 gap-2">
          <h3 className="font-heading text-lg font-medium text-wood-dark">
            {editingAddress ? "Edit Address" : "Add New Address"}
          </h3>
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={detecting}
            className="text-[10px] font-semibold uppercase tracking-wider text-wood-medium hover:text-wood-dark border-b border-wood-medium/20 hover:border-wood-medium pb-0.5 transition-all disabled:opacity-50 flex items-center gap-1 cursor-pointer"
          >
            {detecting ? (
              <>
                <span className="inline-block size-3 animate-spin rounded-full border border-current border-t-transparent" />
                Detecting...
              </>
            ) : (
              <>📍 Use Location</>
            )}
          </button>
        </div>

        {detectError && (
          <p className="text-[10px] text-destructive bg-destructive/5 border border-destructive/20 p-2.5 rounded-sm mb-4" role="alert">
            ⚠️ {detectError}
          </p>
        )}

        <form id="address-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary/80 mb-1.5 block">Label (e.g. Home, Office)</Label>
            <Input
              id="title"
              name="title"
              defaultValue={defaultVals.title || ""}
              placeholder="Home"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary/80 mb-1.5 block">Full Name / Recipient</Label>
            <Input
              id="fullName"
              name="fullName"
              defaultValue={defaultVals.fullName}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary/80 mb-1.5 block">10-Digit Mobile Number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              pattern="[0-9]{10}"
              maxLength={10}
              defaultValue={defaultVals.phone}
              placeholder="9876543210"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="postalCode" className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary/80 mb-1.5 block">PIN Code</Label>
            <Input
              id="postalCode"
              name="postalCode"
              type="text"
              pattern="[1-9][0-9]{5}"
              maxLength={6}
              defaultValue={defaultVals.postalCode}
              placeholder="560001"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="street" className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary/80 mb-1.5 block">Street Address</Label>
            <Input
              id="street"
              name="street"
              defaultValue={defaultVals.street}
              placeholder="Flat/House No., Building, Street Name"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="apartment" className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary/80 mb-1.5 block">Apartment, Suite, Unit, etc. (Optional)</Label>
            <Input
              id="apartment"
              name="apartment"
              defaultValue={defaultVals.apartment || ""}
              placeholder="Landmark, Area, or Sector details"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-1">
              <Label htmlFor="city" className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary/80 mb-1.5 block">City</Label>
              <Input
                id="city"
                name="city"
                defaultValue={defaultVals.city}
                placeholder="Bengaluru"
                required
              />
            </div>
            <div className="space-y-1.5 col-span-1">
              <Label htmlFor="state" className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary/80 mb-1.5 block">State</Label>
              <select
                id="state"
                name="state"
                defaultValue={defaultVals.state}
                className="flex h-10 w-full rounded-sm border border-border bg-white px-3.5 py-2 text-sm shadow-xs transition-all focus-visible:border-wood-medium focus-visible:ring-2 focus-visible:ring-wood-medium/10 outline-none cursor-pointer"
                required
              >
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2.5 pt-1">
            <input
              id="isDefault"
              name="isDefault"
              type="checkbox"
              value="true"
              defaultChecked={defaultVals.isDefault}
              className="size-4 rounded-xs border-border text-wood-medium focus:ring-wood-medium/20 focus:ring-offset-0 cursor-pointer accent-wood-medium"
            />
            <Label htmlFor="isDefault" className="text-xs cursor-pointer select-none text-text-secondary hover:text-text-primary transition-colors">
              Set as default shipping address
            </Label>
          </div>

          {formError && (
            <p className="text-xs text-destructive" role="alert">
              {formError}
            </p>
          )}

          <div className="flex gap-3 pt-3">
            <Button
              type="submit"
              disabled={isPending}
              className="h-10 px-5 bg-wood-dark text-background-primary hover:bg-wood-medium transition-all duration-200 rounded-sm text-[10px] uppercase tracking-widest font-semibold cursor-pointer"
            >
              {isPending ? "Saving..." : "Save Address"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAdding(false);
                setEditingAddress(null);
                setFormError(null);
              }}
              className="h-10 px-5 border-border hover:bg-background-secondary text-text-primary transition-all duration-200 rounded-sm text-[10px] uppercase tracking-widest font-semibold cursor-pointer"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h2 className="font-heading text-xl sm:text-2xl font-medium text-wood-dark">Saved Addresses</h2>
        <Button
          onClick={() => setIsAdding(true)}
          size="sm"
          className="text-[10px] uppercase tracking-wider font-semibold hover:bg-wood-medium hover:text-white transition-all cursor-pointer"
        >
          Add New Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-8 rounded-sm border border-dashed border-border p-6 bg-wood-medium/[0.02]">
          <p className="text-sm text-text-secondary">No saved addresses found.</p>
          <Button onClick={() => setIsAdding(true)} variant="link" size="sm" className="mt-2 text-wood-medium">
            Add your first shipping address
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`rounded-sm border p-5 flex flex-col justify-between transition-all duration-300 shadow-2xs ${
                addr.isDefault
                  ? "border-wood-medium/60 bg-white"
                  : "border-border bg-white hover:border-wood-medium/20"
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="font-heading text-base font-semibold text-wood-dark tracking-wide">
                    {addr.title || "Home"}
                  </span>
                  {addr.isDefault && (
                    <span className="text-[9px] uppercase font-semibold tracking-wider text-wood-medium border border-wood-medium/20 px-2 py-0.5 rounded-sm bg-wood-medium/[0.02]">
                      Default
                    </span>
                  )}
                </div>
                <div className="text-xs text-text-secondary space-y-1.5 mt-3">
                  <p className="font-medium text-text-primary text-sm tracking-wide">{addr.fullName}</p>
                  <p>{addr.street}</p>
                  {addr.apartment && <p>{addr.apartment}</p>}
                  <p>{addr.city}, {addr.state} - {addr.postalCode}</p>
                  <p className="pt-1 text-[11px] text-text-secondary/80">Phone: +91 {addr.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3.5 border-t border-border/40 mt-4 text-[10px] uppercase tracking-wider font-semibold">
                <button
                  onClick={() => setEditingAddress(addr)}
                  className="text-text-primary hover:text-wood-medium transition-colors cursor-pointer"
                >
                  Edit
                </button>
                <span className="text-border/60 font-light">|</span>
                <button
                  onClick={() => handleDelete(addr.id)}
                  className="text-destructive hover:text-destructive/80 transition-colors cursor-pointer"
                >
                  Delete
                </button>
                {!addr.isDefault && (
                  <>
                    <span className="text-border/60 font-light">|</span>
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-wood-medium hover:text-wood-dark transition-colors cursor-pointer"
                    >
                      Set Default
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
