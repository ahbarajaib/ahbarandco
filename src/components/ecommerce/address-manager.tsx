"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  saveAddress,
  deleteAddress,
  setDefaultAddress,
  type AddressActionState,
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
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          if (!res.ok) throw new Error("Failed to fetch address details");

          const data = await res.json();
          const addr = data.address;

          if (addr) {
            const road = addr.road || addr.street || "";
            const suburb = addr.suburb || addr.neighbourhood || addr.village || "";
            const computedStreet = [road, suburb].filter(Boolean).join(", ");
            const computedCity = addr.city || addr.town || addr.city_district || addr.county || "";
            const computedState = addr.state || "";
            const computedPostcode = addr.postcode || "";

            const form = document.getElementById("address-form") as HTMLFormElement;
            if (form) {
              const streetInput = form.elements.namedItem("street") as HTMLInputElement;
              const cityInput = form.elements.namedItem("city") as HTMLInputElement;
              const stateSelect = form.elements.namedItem("state") as HTMLSelectElement;
              const postalCodeInput = form.elements.namedItem("postalCode") as HTMLInputElement;

              if (streetInput) streetInput.value = computedStreet;
              if (cityInput) cityInput.value = computedCity;
              if (postalCodeInput) postalCodeInput.value = computedPostcode;

              if (stateSelect && computedState) {
                const match = INDIAN_STATES.find(
                  (s) => s.toLowerCase() === computedState.toLowerCase() ||
                         computedState.toLowerCase().includes(s.toLowerCase())
                );
                if (match) {
                  stateSelect.value = match;
                } else {
                  const partialMatch = INDIAN_STATES.find(s => s.toLowerCase().startsWith(computedState.toLowerCase().slice(0, 4)));
                  if (partialMatch) stateSelect.value = partialMatch;
                }
              }
            }
          } else {
            setDetectError("Address details not found.");
          }
        } catch (err) {
          console.error("Reverse geocoding error:", err);
          setDetectError("Failed to auto-detect address. Enter details manually.");
        } finally {
          setDetecting(false);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        setDetecting(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setDetectError("Location access denied. Please enable permission to detect.");
            break;
          default:
            setDetectError("Failed to detect location.");
        }
      },
      { timeout: 10000 }
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
      <div className="rounded-sm border border-border bg-white p-5 shadow-sm">
        <div className="flex justify-between items-center mb-4 gap-2">
          <h3 className="font-heading text-lg font-medium">
            {editingAddress ? "Edit Address" : "Add New Address"}
          </h3>
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={handleDetectLocation}
            disabled={detecting}
            className="flex items-center gap-1"
          >
            {detecting ? (
              <>
                <span className="inline-block size-3 animate-spin rounded-full border border-current border-t-transparent" />
                Detecting...
              </>
            ) : (
              <>📍 Use Location</>
            )}
          </Button>
        </div>

        {detectError && (
          <p className="text-[10px] text-destructive bg-destructive/5 border border-destructive/20 p-2 rounded mb-3" role="alert">
            ⚠️ {detectError}
          </p>
        )}

        <form id="address-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label htmlFor="title">Label (e.g. Home, Office)</Label>
              <Input
                id="title"
                name="title"
                defaultValue={defaultVals.title || ""}
                placeholder="Home"
                required
              />
            </div>
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label htmlFor="fullName">Full Name / Recipient</Label>
              <Input
                id="fullName"
                name="fullName"
                defaultValue={defaultVals.fullName}
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label htmlFor="phone">10-Digit Mobile Number</Label>
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
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label htmlFor="postalCode">PIN Code</Label>
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
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="street">Street Address</Label>
            <Input
              id="street"
              name="street"
              defaultValue={defaultVals.street}
              placeholder="Flat/House No., Building, Street Name"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="apartment">Apartment, Suite, Unit, etc. (Optional)</Label>
            <Input
              id="apartment"
              name="apartment"
              defaultValue={defaultVals.apartment || ""}
              placeholder="Landmark, Area, or Sector details"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                defaultValue={defaultVals.city}
                placeholder="Bengaluru"
                required
              />
            </div>
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label htmlFor="state">State</Label>
              <select
                id="state"
                name="state"
                defaultValue={defaultVals.state}
                className="flex h-8 w-full rounded-lg border border-border bg-background px-2.5 py-1 text-sm shadow-sm transition-all focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
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

          <div className="flex items-center gap-2 pt-2">
            <input
              id="isDefault"
              name="isDefault"
              type="checkbox"
              value="true"
              defaultChecked={defaultVals.isDefault}
              className="size-4 rounded border-border"
            />
            <Label htmlFor="isDefault" className="text-sm cursor-pointer select-none">
              Set as default shipping address
            </Label>
          </div>

          {formError && (
            <p className="text-xs text-destructive" role="alert">
              {formError}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isPending} size="sm">
              {isPending ? "Saving..." : "Save Address"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsAdding(false);
                setEditingAddress(null);
                setFormError(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-heading text-2xl font-medium">Saved Addresses</h2>
        <Button onClick={() => setIsAdding(true)} size="sm">
          Add New Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-8 rounded border border-dashed border-border p-6 bg-wood-medium/5">
          <p className="text-sm text-text-secondary">No saved addresses found.</p>
          <Button onClick={() => setIsAdding(true)} variant="link" size="sm" className="mt-2 text-wood-medium">
            Add your first shipping address
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`rounded-sm border p-4 flex flex-col justify-between transition-all ${
                addr.isDefault
                  ? "border-wood-medium bg-wood-medium/5"
                  : "border-border bg-white"
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="font-heading text-base font-semibold text-wood-dark">
                    {addr.title || "Home"}
                  </span>
                  {addr.isDefault && (
                    <span className="text-[10px] uppercase font-bold tracking-wider text-wood-medium border border-wood-medium px-2 py-0.5 rounded-full bg-white">
                      Default
                    </span>
                  )}
                </div>
                <div className="text-xs text-text-secondary space-y-1">
                  <p className="font-medium text-foreground text-sm">{addr.fullName}</p>
                  <p>{addr.street}</p>
                  {addr.apartment && <p>{addr.apartment}</p>}
                  <p>{addr.city}, {addr.state} - {addr.postalCode}</p>
                  <p>Phone: +91 {addr.phone}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-4 border-t border-border/40 mt-4 text-xs">
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => setEditingAddress(addr)}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="xs"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => handleDelete(addr.id)}
                >
                  Delete
                </Button>
                {!addr.isDefault && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => handleSetDefault(addr.id)}
                  >
                    Set Default
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
