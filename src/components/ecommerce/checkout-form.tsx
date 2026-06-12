"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/utils";
import { createCheckoutOrder, verifyPayment } from "@/lib/payment-actions";
import { saveAddress } from "@/lib/address-actions";

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

type CartItem = {
  productId: string;
  quantity: number;
  product: {
    name: string;
    price: number;
    currency: string;
  };
};

type CheckoutFormProps = {
  cartItems: CartItem[];
  addresses: Address[];
  subtotal: number;
  shipping: number;
  total: number;
};

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function CheckoutForm({
  cartItems,
  addresses,
  subtotal,
  shipping,
  total,
}: CheckoutFormProps) {
  const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0];
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    defaultAddress ? defaultAddress.id : null
  );
  const [useNewAddress, setUseNewAddress] = useState(addresses.length === 0);
  const [saveToAccount, setSaveToAccount] = useState(true);

  // New address state fields
  const [newTitle, setNewTitle] = useState("Home");
  const [newFullName, setNewFullName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newStreet, setNewStreet] = useState("");
  const [newApartment, setNewApartment] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newState, setNewState] = useState("Karnataka");
  const [newPostalCode, setNewPostalCode] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const INDIAN_STATES = [
    "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
    "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa",
    "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka",
    "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
    "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim",
    "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
  ];

  const [detecting, setDetecting] = useState(false);
  const [detectError, setDetectError] = useState<string | null>(null);

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

            setNewStreet(computedStreet);
            setNewCity(computedCity);
            setNewPostalCode(computedPostcode);

            if (computedState) {
              const match = INDIAN_STATES.find(
                (s) => s.toLowerCase() === computedState.toLowerCase() ||
                       computedState.toLowerCase().includes(s.toLowerCase())
                );
              if (match) {
                setNewState(match);
              } else {
                const partialMatch = INDIAN_STATES.find(s => s.toLowerCase().startsWith(computedState.toLowerCase().slice(0, 4)));
                if (partialMatch) setNewState(partialMatch);
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

  async function handlePay() {
    setError(null);

    // 1. Resolve address details
    let shippingAddress: Omit<Address, "id" | "userId" | "createdAt" | "updatedAt">;

    if (useNewAddress) {
      // Basic validation
      if (!newFullName || !newPhone || !newStreet || !newCity || !newState || !newPostalCode) {
        setError("Please fill out all required shipping fields.");
        return;
      }
      if (!/^[0-9]{10}$/.test(newPhone)) {
        setError("Phone number must be exactly 10 digits.");
        return;
      }
      if (!/^[1-9][0-9]{5}$/.test(newPostalCode)) {
        setError("PIN code must be exactly 6 digits.");
        return;
      }

      shippingAddress = {
        title: newTitle || "Home",
        fullName: newFullName,
        phone: newPhone,
        street: newStreet,
        apartment: newApartment || null,
        city: newCity,
        state: newState,
        postalCode: newPostalCode,
        country: "India",
        isDefault: false,
      };
    } else {
      const selected = addresses.find((a) => a.id === selectedAddressId);
      if (!selected) {
        setError("Please select a shipping address.");
        return;
      }
      shippingAddress = {
        title: selected.title,
        fullName: selected.fullName,
        phone: selected.phone,
        street: selected.street,
        apartment: selected.apartment,
        city: selected.city,
        state: selected.state,
        postalCode: selected.postalCode,
        country: selected.country,
        isDefault: selected.isDefault,
      };
    }

    startTransition(async () => {
      try {
        // If they entered a new address and wanted to save it
        if (useNewAddress && saveToAccount) {
          const form = new FormData();
          form.append("title", shippingAddress.title || "Home");
          form.append("fullName", shippingAddress.fullName);
          form.append("phone", shippingAddress.phone);
          form.append("street", shippingAddress.street);
          form.append("apartment", shippingAddress.apartment || "");
          form.append("city", shippingAddress.city);
          form.append("state", shippingAddress.state);
          form.append("postalCode", shippingAddress.postalCode);
          form.append("isDefault", "false"); // Just add it to account, don't force default override here
          await saveAddress({}, form);
        }

        // 2. Initiate order creation
        const checkout = await createCheckoutOrder(shippingAddress);
        if (checkout.error || !checkout.success) {
          setError(checkout.error ?? "Unable to initiate order.");
          return;
        }

        // 3. Load Razorpay overlay
        const loaded = await loadRazorpayScript();
        if (!loaded) {
          setError("Failed to load Razorpay library. Please check your internet connection.");
          return;
        }

        const razorpay = new window.Razorpay({
          key: checkout.keyId,
          amount: checkout.amount,
          currency: checkout.currency,
          name: "Ahbar & Co.",
          description: `Order ${checkout.orderNumber}`,
          order_id: checkout.razorpayOrderId,
          prefill: checkout.customer,
          theme: { color: "#2D221C" },
          handler: async (response: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) => {
            const result = await verifyPayment({
              orderId: checkout.orderId!,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (result.error) {
              setError(result.error);
              return;
            }

            window.location.href = `/orders/${result.orderNumber}?success=1`;
          },
        });

        razorpay.open();
      } catch (err: any) {
        console.error("Checkout submission error:", err);
        setError("Payment could not be completed. Check Razorpay setup.");
      }
    });
  }

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-12">
      {/* Shipping details column */}
      <div className="space-y-8">
        <div className="space-y-4">
          <h2 className="font-heading text-2xl font-medium">Shipping Address</h2>

          {addresses.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm text-text-secondary">Select a saved shipping address:</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`relative rounded-sm border p-4 flex flex-col justify-between cursor-pointer select-none transition-all ${
                      !useNewAddress && selectedAddressId === addr.id
                        ? "border-wood-medium bg-wood-medium/5"
                        : "border-border bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="shipping_addr"
                        checked={!useNewAddress && selectedAddressId === addr.id}
                        onChange={() => {
                          setSelectedAddressId(addr.id);
                          setUseNewAddress(false);
                        }}
                        className="mt-1 size-4 accent-wood-medium"
                      />
                      <div className="text-xs text-text-secondary space-y-1">
                        <span className="font-heading font-semibold text-wood-dark block text-sm mb-1">
                          {addr.title || "Home"} {addr.isDefault && "(Default)"}
                        </span>
                        <p className="font-medium text-foreground text-sm">{addr.fullName}</p>
                        <p>{addr.street}</p>
                        {addr.apartment && <p>{addr.apartment}</p>}
                        <p>
                          {addr.city}, {addr.state} - {addr.postalCode}
                        </p>
                        <p>Phone: +91 {addr.phone}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  id="toggle_new_addr"
                  type="checkbox"
                  checked={useNewAddress}
                  onChange={(e) => setUseNewAddress(e.target.checked)}
                  className="size-4 accent-wood-medium"
                />
                <Label htmlFor="toggle_new_addr" className="text-sm cursor-pointer select-none">
                  Deliver to a different address
                </Label>
              </div>
            </div>
          )}

          {useNewAddress && (
            <div className="rounded-sm border border-border bg-white p-5 space-y-4 shadow-sm animate-reveal">
              <div className="flex justify-between items-center gap-2">
                <h3 className="font-heading text-lg font-medium">New Shipping Details</h3>
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
                <p className="text-[10px] text-destructive bg-destructive/5 border border-destructive/20 p-2 rounded" role="alert">
                  ⚠️ {detectError}
                </p>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <Label htmlFor="new_title">Address Label (Home, Office)</Label>
                  <Input
                    id="new_title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Home"
                    required
                  />
                </div>
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <Label htmlFor="new_fullName">Full Name / Recipient</Label>
                  <Input
                    id="new_fullName"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <Label htmlFor="new_phone">10-Digit Mobile Number</Label>
                  <Input
                    id="new_phone"
                    type="tel"
                    maxLength={10}
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="9876543210"
                    required
                  />
                </div>
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <Label htmlFor="new_postalCode">PIN Code</Label>
                  <Input
                    id="new_postalCode"
                    type="text"
                    maxLength={6}
                    value={newPostalCode}
                    onChange={(e) => setNewPostalCode(e.target.value)}
                    placeholder="560001"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="new_street">Street Address</Label>
                <Input
                  id="new_street"
                  value={newStreet}
                  onChange={(e) => setNewStreet(e.target.value)}
                  placeholder="Flat/House No., Building, Street Name"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="new_apartment">Apartment, Suite, Unit, etc. (Optional)</Label>
                <Input
                  id="new_apartment"
                  value={newApartment}
                  onChange={(e) => setNewApartment(e.target.value)}
                  placeholder="Landmark, Area, or Sector details"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <Label htmlFor="new_city">City</Label>
                  <Input
                    id="new_city"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="Bengaluru"
                    required
                  />
                </div>
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <Label htmlFor="new_state">State</Label>
                  <select
                    id="new_state"
                    value={newState}
                    onChange={(e) => setNewState(e.target.value)}
                    className="flex h-8 w-full rounded-lg border border-border bg-background px-2.5 py-1 text-sm shadow-sm outline-none"
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
                  id="save_to_acc"
                  type="checkbox"
                  checked={saveToAccount}
                  onChange={(e) => setSaveToAccount(e.target.checked)}
                  className="size-4 accent-wood-medium"
                />
                <Label htmlFor="save_to_acc" className="text-sm cursor-pointer select-none">
                  Save this address to my account
                </Label>
              </div>
            </div>
          )}
        </div>

        {/* Order review items */}
        <div className="space-y-4 pt-4 border-t border-border/60">
          <h2 className="font-heading text-2xl font-medium">Review Items</h2>
          <ul className="divide-y divide-border">
            {cartItems.map((item) => (
              <li
                key={item.productId}
                className="flex items-center justify-between gap-4 py-4 text-sm sm:text-base"
              >
                <div>
                  <span className="font-medium">{item.product.name}</span>
                  <span className="text-text-secondary text-sm ml-2">× {item.quantity}</span>
                </div>
                <span>
                  {formatPrice(
                    item.product.price * item.quantity,
                    item.product.currency
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Summary and Pay column */}
      <aside className="h-fit border border-border bg-background-primary p-6">
        <h2 className="font-heading text-xl font-medium">Payment Details</h2>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-text-secondary">Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Shipping</span>
            <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2 text-base font-medium">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>

        {error && (
          <p className="mt-4 text-xs text-destructive bg-destructive/5 border border-destructive/20 p-3 rounded" role="alert">
            {error}
          </p>
        )}

        <div className="mt-6">
          <Button
            type="button"
            className="w-full h-12 text-sm font-semibold uppercase tracking-wider bg-wood-dark hover:bg-wood-dark/95 text-white"
            onClick={handlePay}
            disabled={isPending}
          >
            {isPending ? "Processing..." : "Pay with Razorpay"}
          </Button>
        </div>

        <Button
          variant="ghost"
          className="mt-4 w-full h-10 text-xs font-semibold uppercase tracking-wider"
          render={<Link href="/cart" />}
        >
          Back to Cart
        </Button>
      </aside>
    </div>
  );
}
