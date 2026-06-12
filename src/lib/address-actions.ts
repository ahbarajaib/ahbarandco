"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AddressSchema } from "@/lib/validations";

export type AddressActionState = {
  error?: string;
  success?: boolean;
  message?: string;
};

export async function getSavedAddresses() {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  return await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
}

export async function saveAddress(
  _prev: AddressActionState,
  formData: FormData
): Promise<AddressActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be signed in to manage addresses." };
  }

  const id = formData.get("id") ? String(formData.get("id")) : undefined;
  const title = String(formData.get("title") ?? "").trim();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const street = String(formData.get("street") ?? "").trim();
  const apartment = String(formData.get("apartment") ?? "").trim() || null;
  const city = String(formData.get("city") ?? "").trim();
  const state = String(formData.get("state") ?? "").trim();
  const postalCode = String(formData.get("postalCode") ?? "").trim();
  const isDefault = formData.get("isDefault") === "true";

  const validation = AddressSchema.safeParse({
    title,
    fullName,
    phone,
    street,
    apartment,
    city,
    state,
    postalCode,
  });

  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  try {
    const existingCount = await prisma.address.count({
      where: { userId: session.user.id },
    });

    // Automatically make it default if it's the first address
    const shouldBeDefault = existingCount === 0 ? true : isDefault;

    if (shouldBeDefault) {
      // Set all other addresses for this user to isDefault = false
      await prisma.address.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false },
      });
    }

    if (id) {
      // Check ownership
      const existingAddress = await prisma.address.findFirst({
        where: { id, userId: session.user.id },
      });
      if (!existingAddress) {
        return { error: "Address not found or unauthorized." };
      }

      await prisma.address.update({
        where: { id },
        data: {
          title: title || "Home",
          fullName,
          phone,
          street,
          apartment,
          city,
          state,
          postalCode,
          isDefault: shouldBeDefault,
        },
      });
    } else {
      await prisma.address.create({
        data: {
          userId: session.user.id,
          title: title || "Home",
          fullName,
          phone,
          street,
          apartment,
          city,
          state,
          postalCode,
          isDefault: shouldBeDefault,
        },
      });
    }

    revalidatePath("/account");
    revalidatePath("/checkout");

    return { success: true, message: id ? "Address updated successfully." : "Address saved successfully." };
  } catch (error) {
    console.error("Save address error:", error);
    return { error: "Failed to save address. Please try again." };
  }
}

export async function deleteAddress(id: string): Promise<AddressActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized." };
  }

  try {
    const address = await prisma.address.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!address) {
      return { error: "Address not found." };
    }

    await prisma.address.delete({ where: { id } });

    // If we deleted the default address, set another one as default
    if (address.isDefault) {
      const nextAddress = await prisma.address.findFirst({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
      });
      if (nextAddress) {
        await prisma.address.update({
          where: { id: nextAddress.id },
          data: { isDefault: true },
        });
      }
    }

    revalidatePath("/account");
    revalidatePath("/checkout");

    return { success: true, message: "Address deleted successfully." };
  } catch (error) {
    console.error("Delete address error:", error);
    return { error: "Failed to delete address." };
  }
}

export async function setDefaultAddress(id: string): Promise<AddressActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized." };
  }

  try {
    const address = await prisma.address.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!address) {
      return { error: "Address not found." };
    }

    await prisma.$transaction([
      prisma.address.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false },
      }),
      prisma.address.update({
        where: { id },
        data: { isDefault: true },
      }),
    ]);

    revalidatePath("/account");
    revalidatePath("/checkout");

    return { success: true, message: "Default address updated." };
  } catch (error) {
    console.error("Set default address error:", error);
    return { error: "Failed to set default address." };
  }
}
